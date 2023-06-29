import React, { RefObject, useMemo, useState } from "react";
import { ScrollViewProps, View, ViewStyle } from "react-native";
import { G, Rect, Svg, Text } from "react-native-svg";
import Animated, { AnimateProps } from "react-native-reanimated";

import { AbstractChartConfig, AbstractChartProps } from "./AbstractHooks";
import { BAR_WIDTH, useBaseChart } from "./AbstractHooks";
import { useDidMountEffect } from "./hooks";

export interface MultiBarChartProps extends AbstractChartProps {
  labels: (string | string[])[];
  data: number[][];
  barColors: string[];
  width: number;
  height: number;
  yLabelsWidth: number;
  chartConfig: AbstractChartConfig;
  hideLegend: boolean;
  style?: Partial<ViewStyle>;
  barPercentage?: number;
  decimalPlaces?: number;
  /**
   * Show vertical labels - default: True.
   */
  withVerticalLabels?: boolean;
  /**
   * Show horizontal labels - default: True.
   */
  withHorizontalLabels?: boolean;
  /**
   * The number of horizontal lines
   */
  segments?: number;

  percentile?: boolean;
  scrollViewProps?: AnimateProps<ScrollViewProps>;
  /**
   * Percentage of the chart height, dedicated to vertical labels
   * (space below chart)
   */
  verticalLabelsHeight?: number;

  formatYLabel?: (yLabel: string) => string;

  /** Callback that is called when a data point is clicked.
   */
  onBarPress?: (data: { index: number; value: number[] }) => void;

  spaceBetweenItems?: number;
  highlightedIndex?: number;
}

export default React.forwardRef(
  (props: MultiBarChartProps, ref: RefObject<Animated.ScrollView>) => {
    const baseChart = useBaseChart({ ...props, data: props.data.flat() });
    const spaceBetweenItems = props.spaceBetweenItems
      ? props.spaceBetweenItems
      : 3;
    const baseBarWidth = useMemo(
      () => props.chartConfig.barWidth || BAR_WIDTH,
      [props.chartConfig.barWidth]
    );
    const barPercentage = useMemo(() => props.chartConfig.barPercentage || 1, [
      props.chartConfig.barPercentage
    ]);

    const [highlightIndex, setHighlightIndex] = useState<number | undefined>(
      props.highlightedIndex
    );

    useDidMountEffect(() => {
      setHighlightIndex(props.highlightedIndex);
    }, [props.highlightedIndex]);

    const getBarRadius = (ret: string | any[], x: string | any[]) => {
      return props.chartConfig.barRadius && ret.length === x.length - 1
        ? props.chartConfig.barRadius
        : 0;
    };

    const renderBars = ({
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      border,
      colors,
      stackedBar = false,
      verticalLabelsHeight
    }: Pick<
      Omit<AbstractChartConfig, "data">,
      | "width"
      | "height"
      | "paddingRight"
      | "paddingTop"
      | "stackedBar"
      | "verticalLabelsHeight"
    > & {
      border: number;
      colors: string[];
      data: number[][];
      onBarPress: MultiBarChartProps["onBarPress"];
    }) =>
      data.map((x, i) => {
        const barWidth = baseBarWidth * barPercentage;
        const ret = [];
        let h = 0;

        const onPress = () => {
          if (!props.onBarPress) {
            return;
          }

          props.onBarPress({
            index: i,
            value: x
          });

          setHighlightIndex(i);
        };

        let fac = 1;
        if (stackedBar) {
          fac = 0.7;
        }
        const sum = props.percentile ? x.reduce((a, b) => a + b, 0) : border;
        const barsAreaHeight = height - verticalLabelsHeight;

        const xCenter =
          (paddingRight +
            (i * (width - paddingRight)) / data.length +
            (barWidth * x.length) / 2) *
          fac;
        const itemCount = x.length;
        for (let z = 0; z < itemCount; z++) {
          h = barsAreaHeight * (x[z] / sum) + 1;

          const y = barsAreaHeight;
          const totalBarsWidth =
            (barWidth + spaceBetweenItems) * itemCount +
            spaceBetweenItems * (itemCount - 1);
          const mid = totalBarsWidth / 2;

          const cx = xCenter - (mid - (barWidth + spaceBetweenItems) * z);

          ret.push(
            <Rect
              key={Math.random()}
              x={cx}
              y={barsAreaHeight - h + paddingTop}
              rx={getBarRadius(ret, x)}
              ry={getBarRadius(ret, x)}
              width={barWidth}
              height={h}
              onPress={onPress}
              fill={colors[z]}
            />
          );

          if (!props.hideLegend) {
            ret.push(
              <Text
                key={Math.random()}
                x={cx + 7 + barWidth / 2}
                textAnchor="end"
                y={h > 15 ? y + 15 : y + 7}
                {...baseChart.getPropsForLabels()}
              >
                {x[z]}
              </Text>
            );
          }
        }

        return ret;
      });

    const renderLegend = ({
      legend,
      colors,
      width,
      height
    }: Pick<AbstractChartConfig, "width" | "height"> & {
      legend: string[];
      colors: string[];
    }) =>
      legend.map((x, i) => {
        return (
          <G key={Math.random()}>
            <Rect
              width="16px"
              height="16px"
              fill={colors[i]}
              rx={8}
              ry={8}
              x={width * 0.71}
              y={height * 0.7 - i * 50}
            />
            <Text
              x={width * 0.78}
              y={height * 0.76 - i * 50}
              {...baseChart.getPropsForLabels()}
            >
              {x}
            </Text>
          </G>
        );
      });

    const paddingTop = 15;
    const barWidth = baseBarWidth * barPercentage;

    const {
      width,
      height,
      style = {},
      data,
      labels,
      yLabelsWidth = 64,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      segments = 4,
      percentile = false,
      formatYLabel = (yLabel: string) => {
        return yLabel;
      },
      onBarPress,
      scrollViewProps = {},
      hideLegend = false
    } = useMemo(() => props, [props]);

    const dataLength = data.length;
    const totalEmptySpace = width - baseBarWidth * barPercentage * dataLength;
    const horizontalPadding = totalEmptySpace / (dataLength + 1);

    const config = useMemo(
      () => ({
        width,
        paddingRight: horizontalPadding,
        height,
        ...props.chartConfig
      }),
      [props]
    );

    let border = 0;

    let max = 0;
    for (let i = 0; i < data.length; i++) {
      const actual = data[i].reduce((pv, cv) => Math.max(pv, cv), 0);
      if (actual > max) {
        max = actual;
      }
    }

    if (percentile) {
      border = 100;
    } else {
      border = max;
    }

    // const showLegend = !hideLegend && legend && legend.length != 0;
    // const stackedBar = showLegend;

    const defs = useMemo(
      () =>
        baseChart.renderDefs({
          ...config,
          ...props.chartConfig
        }),
      [config, props.chartConfig]
    );

    const horizontalLabels = useMemo(
      () =>
        withHorizontalLabels
          ? baseChart.renderHorizontalLabels({
              ...config,
              count: segments,
              paddingTop,
              paddingRight: yLabelsWidth as number,
              formatYLabel
            })
          : null,
      [
        baseChart.renderHorizontalLabels,
        config,
        segments,
        border,
        paddingTop,
        yLabelsWidth,
        formatYLabel
      ]
    );

    const horizontalLines = useMemo(
      () =>
        baseChart.renderHorizontalLines({
          ...config,
          count: segments,
          paddingTop
        }),
      [baseChart.renderHorizontalLines, config, segments, paddingTop]
    );

    const verticalLabels = useMemo(
      () =>
        withVerticalLabels
          ? baseChart.renderVerticalLabels({
              ...config,
              onPress: ({ index }) => {
                setHighlightIndex(index);
                //@ts-ignore
                onBarPress({ index });
              },
              highlightIndex: highlightIndex,
              labels: labels,
              paddingTop,
              horizontalOffset: barWidth
            })
          : null,
      [
        baseChart.renderVerticalLabels,
        highlightIndex,
        config,
        labels,
        paddingTop,
        barWidth
      ]
    );

    const bars = useMemo(() => {
      return renderBars({
        ...config,
        data: data,
        border,
        colors: props.barColors,
        paddingTop,
        onBarPress: onBarPress
      });
    }, [
      config,
      data,
      barWidth,
      barPercentage,
      border,
      props.barColors,
      paddingTop,
      onBarPress
    ]);

    // const legend = useMemo(
    //   () =>
    //     showLegend &&
    //     renderLegend({
    //       ...config,
    //       legend: legend,
    //       colors: props.barColors
    //     }),
    //   [config, legend, props.barColors]
    // );

    return (
      <View style={[style, { flexDirection: "row" }]}>
        <View>
          <Svg height={height} width={yLabelsWidth}>
            {/* {defs}
            {rect} */}
            <G>{horizontalLabels}</G>
          </Svg>
        </View>
        <Animated.ScrollView
          ref={ref}
          horizontal={true}
          bounces={false}
          {...scrollViewProps}
        >
          {/* WE SET ONPRESS BECAUSE THAT ALLOWS THE SVG TO BE DRAGGLE INSIDE THE SCROLLVIEW */}
          <Svg height={height} width={width} onPress={() => {}}>
            {defs}
            <G>{horizontalLines}</G>
            <G>{verticalLabels}</G>
            <G>{bars}</G>
            {/* {legend} */}
          </Svg>
        </Animated.ScrollView>
      </View>
    );
  }
);

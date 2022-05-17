import React, { RefObject, useMemo, useState } from "react";
import { ScrollViewProps, View, ViewStyle } from "react-native";
import { G, Rect, Svg, Text } from "react-native-svg";
import Animated, { AnimateProps } from "react-native-reanimated";

import {
  BaseChart,
  AbstractChartConfig,
  AbstractChartProps,
  DEFAULT_X_LABELS_HEIGHT
} from "./AbstractChart";
import { useBaseChart } from "./AbstractHooks";
import { useDidMountEffect } from "./hooks";

export interface StackedBarChartData {
  labels: (string | string[])[];
  legend: string[];
  data: number[][];
  barColors: string[];
}

export interface StackedBarChartProps extends AbstractChartProps {
  /**
   * E.g.
   * ```javascript
   * const data = {
   *   labels: ["Test1", "Test2"],
   *   legend: ["L1", "L2", "L3"],
   *   data: [[60, 60, 60], [30, 30, 60]],
   *   barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
   * };
   * ```
   */
  data: StackedBarChartData;
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
  (props: StackedBarChartProps, ref: RefObject<Animated.ScrollView>) => {
    const baseChart = useBaseChart(props);
    const spaceBetweenItems = props.spaceBetweenItems
      ? props.spaceBetweenItems
      : 3;

    const [highlightIndex, setHighlightIndex] = useState<number | undefined>(
      props.highlightedIndex
    );

    useDidMountEffect(() => {
      setHighlightIndex(props.highlightedIndex);
    }, [props.highlightedIndex]);

    const getBarPercentage = () => {
      const { barPercentage = 1 } = props.chartConfig;
      return barPercentage;
    };

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
      onBarPress: StackedBarChartProps["onBarPress"];
    }) =>
      data.map((x, i) => {
        const barWidth = 32 * getBarPercentage();
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
    const barWidth = 32 * getBarPercentage();

    const {
      width,
      height,
      style = {},
      data,
      yLabelsWidth = 64,
      withHorizontalLabels = true,
      withVerticalLabels = true,
      segments = 4,
      decimalPlaces,
      percentile = false,
      formatYLabel = (yLabel: string) => {
        return yLabel;
      },
      onBarPress,
      scrollViewProps = {},
      hideLegend = false
    } = props;

    const { paddingRight = barWidth } = style;
    const config = {
      width,
      height,
      verticalLabelsHeight: props.chartConfig.verticalLabelsHeight
    };

    let border = 0;

    let max = 0;
    for (let i = 0; i < data.data.length; i++) {
      const actual = data.data[i].reduce((pv, cv) => Math.max(pv, cv), 0);
      if (actual > max) {
        max = actual;
      }
    }

    if (percentile) {
      border = 100;
    } else {
      border = max;
    }

    const showLegend = !hideLegend && data.legend && data.legend.length != 0;
    const stackedBar = showLegend;

    const defs = useMemo(
      () =>
        baseChart.renderDefs({
          ...config,
          ...props.chartConfig
        }),
      [config, props.chartConfig]
    );

    const rect = useMemo(
      () => (
        <Rect
          width="100%"
          height={height}
          fill={
            props.chartConfig.backgroundColor
              ? props.chartConfig.backgroundColor
              : "url(#backgroundGradient)"
          }
        />
      ),
      [props.chartConfig.backgroundColor]
    );

    const horizontalLabels = useMemo(
      () =>
        withHorizontalLabels
          ? baseChart.renderHorizontalLabels({
              ...config,
              count: segments,
              data: [0, border],
              paddingTop,
              paddingRight: yLabelsWidth as number,
              decimalPlaces,
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
        decimalPlaces,
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
              labels: data.labels,
              paddingRight: paddingRight as number,
              stackedBar,
              paddingTop,
              horizontalOffset: barWidth
            })
          : null,
      [
        baseChart.renderVerticalLabels,
        highlightIndex,
        config,
        data.labels,
        paddingRight,
        stackedBar,
        paddingTop,
        barWidth
      ]
    );

    const bars = useMemo(
      () =>
        renderBars({
          ...config,
          data: data.data,
          border,
          colors: props.data.barColors,
          paddingTop,
          paddingRight: paddingRight as number,
          stackedBar,
          onBarPress: onBarPress
        }),
      [
        config,
        data.data,
        border,
        props.data.barColors,
        paddingTop,
        paddingRight,
        stackedBar,
        onBarPress
      ]
    );

    const legend = useMemo(
      () =>
        showLegend &&
        renderLegend({
          ...config,
          legend: data.legend,
          colors: props.data.barColors
        }),
      [config, data.legend, props.data.barColors]
    );

    return (
      <View style={[style, { flexDirection: "row" }]}>
        <View>
          <Svg height={height} width={yLabelsWidth}>
            {defs}
            {rect}
            <G>{horizontalLabels}</G>
          </Svg>
        </View>
        <Animated.ScrollView
          ref={ref}
          horizontal={true}
          bounces={false}
          {...scrollViewProps}
        >
          <Svg height={height} width={width}>
            {defs}
            <G>{horizontalLines}</G>
            <G>{verticalLabels}</G>
            <G>{bars}</G>
            {legend}
          </Svg>
        </Animated.ScrollView>
      </View>
    );
  }
);

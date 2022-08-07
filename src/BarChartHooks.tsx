import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { ScrollViewProps, View, ViewStyle } from "react-native";
import Animated, { AnimateProps } from "react-native-reanimated";

import {
  Defs,
  G,
  LinearGradient,
  Rect,
  Stop,
  Svg,
  Text
} from "react-native-svg";

import {
  useBaseChart,
  AbstractChartConfig,
  AbstractChartProps,
  DEFAULT_X_LABELS_HEIGHT,
  BAR_WIDTH
} from "./AbstractHooks";
import { ChartData } from "./HelperTypes";
import { useDidMountEffect } from "./hooks";

export interface BarChartProps extends AbstractChartProps {
  data: ChartData;
  width: number;
  height: number;
  fromZero?: boolean;
  withInnerLines?: boolean;
  yAxisLabel: string;
  yAxisSuffix: string;
  chartConfig: AbstractChartConfig;
  style?: Partial<ViewStyle>;
  horizontalLabelRotation?: number;
  verticalLabelRotation?: number;

  /**
   * Show vertical labels - default: True.
   */
  withVerticalLabels?: boolean;
  /**
   * Show horizontal labels - default: True.
   */
  withHorizontalLabels?: boolean;
  /**
        /**
         * This function takes a [whole bunch](https://github.com/indiespirit/react-native-chart-kit/blob/master/src/line-chart.js#L266)
         * of stuff and can render extra elements,
         * such as data point info or additional markup.
         */
  decorator?: Function;
  /** Callback that is called when a data point is clicked.
   */
  onBarPress?: (data: {
    index: number;
    value: number;
    // dataset: ChartData;
    x: number;
    y: number;
  }) => void;
  yLabelsWidth?: number;
  scrollViewProps?: AnimateProps<ScrollViewProps>;

  segments?: number;
  showBarTops?: boolean;
  showValuesOnTopOfBars?: boolean;
  withCustomBarColorFromData?: boolean;
  flatColor?: boolean;

  highlightedIndex?: number;
}

export default React.forwardRef(
  (props: BarChartProps, ref: RefObject<Animated.ScrollView>) => {
    const baseChart = useBaseChart(props);

    const [highlightIndex, setHighlightIndex] = useState<number | undefined>(
      props.highlightedIndex
    );

    useDidMountEffect(() => {
      setHighlightIndex(props.highlightedIndex);
    }, [props.highlightedIndex]);

    const baseBarWidth = useMemo(
      () => props.chartConfig.barWidth || BAR_WIDTH,
      [props.chartConfig.barWidth]
    );
    const barPercentage = useMemo(() => props.chartConfig.barPercentage || 1, [
      props.chartConfig.barPercentage
    ]);

    const renderBars = useCallback(
      ({
        data,
        width,
        height,
        paddingTop,
        paddingRight,
        barRadius,
        withCustomBarColorFromData,
        verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
      }: Pick<
        Omit<AbstractChartConfig, "data">,
        | "width"
        | "height"
        | "paddingRight"
        | "paddingTop"
        | "barRadius"
        | "verticalLabelsHeight"
      > & {
        data: number[];
        withCustomBarColorFromData: boolean;
      }) => {
        height = height - verticalLabelsHeight;
        const baseHeight = baseChart.calcBaseHeight(data, height);
        width = width - paddingRight;

        return data.map((x, i) => {
          const barHeight = baseChart.calcHeight(x, data, height);
          const barWidth = baseBarWidth * barPercentage;

          const cx = paddingRight + (i * width) / data.length + barWidth / 2;
          const cy =
            (barHeight > 0 ? baseHeight - barHeight : baseHeight) + paddingTop;

          const leftX = paddingRight + (i * width) / data.length;
          const topY =
            (barHeight > 0 ? baseHeight - barHeight : baseHeight) + paddingTop;

          const onPress = () => {
            if (!props.onBarPress) {
              return;
            }

            props.onBarPress({
              index: i,
              value: x,
              x: cx,
              y: cy
            });

            setHighlightIndex(i);
          };

          return (
            <Rect
              key={Math.random()}
              x={leftX}
              y={topY}
              rx={barRadius}
              width={barWidth}
              height={Math.abs(barHeight)}
              onPress={onPress}
              fill={
                withCustomBarColorFromData
                  ? `url(#customColor_0_${i})`
                  : "url(#fillShadowGradientFrom)"
              }
            />
          );
        });
      },
      [
        baseChart.calcBaseHeight,
        baseChart.calcHeight,
        barPercentage,
        props.onBarPress
      ]
    );

    const renderBarTops = useCallback(
      ({
        data,
        width,
        height,
        paddingTop,
        paddingRight,
        verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
      }: Pick<
        Omit<AbstractChartConfig, "data">,
        | "width"
        | "height"
        | "paddingRight"
        | "paddingTop"
        | "verticalLabelsHeight"
      > & {
        data: number[];
      }) => {
        const baseHeight = baseChart.calcBaseHeight(data, height);
        width = width - paddingRight;

        return data.map((x, i) => {
          const barHeight = baseChart.calcHeight(x, data, height);
          const barWidth = baseBarWidth * barPercentage;
          return (
            <Rect
              key={Math.random()}
              x={paddingRight + (i * width) / data.length}
              y={(baseHeight - barHeight) * verticalLabelsHeight + paddingTop}
              width={barWidth}
              height={2}
              fill={props.chartConfig.color(0.6)}
            />
          );
        });
      },
      [
        baseChart.calcBaseHeight,
        baseChart.calcHeight,
        barPercentage,
        baseBarWidth
      ]
    );

    const renderColors = useCallback(
      ({
        data,
        flatColor
      }: Pick<AbstractChartConfig, "data"> & {
        flatColor: boolean;
      }) => {
        return data.map((dataset, index) => (
          <Defs key={dataset.key ?? index}>
            {dataset.colors?.map((color, colorIndex) => {
              const highOpacityColor = color(1.0);
              const lowOpacityColor = color(0.1);

              return (
                <LinearGradient
                  id={`customColor_${index}_${colorIndex}`}
                  key={`${index}_${colorIndex}`}
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={1}
                >
                  <Stop
                    offset="0"
                    stopColor={highOpacityColor}
                    stopOpacity="1"
                  />
                  {flatColor ? (
                    <Stop
                      offset="1"
                      stopColor={highOpacityColor}
                      stopOpacity="1"
                    />
                  ) : (
                    <Stop
                      offset="1"
                      stopColor={lowOpacityColor}
                      stopOpacity="0"
                    />
                  )}
                </LinearGradient>
              );
            })}
          </Defs>
        ));
      },
      []
    );

    const renderValuesOnTopOfBars = useCallback(
      ({
        data,
        width,
        height,
        paddingTop,
        paddingRight,
        verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
      }: Pick<
        Omit<AbstractChartConfig, "data">,
        | "width"
        | "height"
        | "paddingRight"
        | "paddingTop"
        | "verticalLabelsHeight"
      > & {
        data: number[];
      }) => {
        height = height - verticalLabelsHeight;
        width = width - paddingRight;
        const baseHeight = baseChart.calcBaseHeight(data, height);

        const renderLabel = (value: number) => {
          if (props.chartConfig.formatTopBarValue) {
            return props.chartConfig.formatTopBarValue(value);
          } else {
            return value;
          }
        };
        return data.map((x, i) => {
          const barHeight = baseChart.calcHeight(x, data, height);
          const barWidth = baseBarWidth * barPercentage;
          return (
            <Text
              key={Math.random()}
              x={paddingRight + (i * width) / data.length + barWidth / 2}
              y={baseHeight - barHeight + paddingTop - 2}
              fill={props.chartConfig.color(0.6)}
              fontSize="12"
              textAnchor="middle"
            >
              {renderLabel(data[i])}
            </Text>
          );
        });
      },
      [
        baseChart.calcBaseHeight,
        baseChart.calcHeight,
        barPercentage,
        baseBarWidth
      ]
    );

    const {
      width,
      height,
      data,
      yLabelsWidth = 64,
      style = {},
      withHorizontalLabels = true,
      withVerticalLabels = true,
      verticalLabelRotation = 0,
      horizontalLabelRotation = 0,
      withInnerLines = true,
      showBarTops = true,
      decorator,
      onBarPress,
      withCustomBarColorFromData = false,
      showValuesOnTopOfBars = false,
      flatColor = false,
      segments = 4,
      scrollViewProps = {}
    } = props;

    const { paddingTop = 16 } = style;

    const dataLength = data.datasets[0].data.length;
    const totalEmptySpace = width - baseBarWidth * barPercentage * dataLength;
    const horizontalPadding = totalEmptySpace / (dataLength + 1);

    const config = {
      width: width,
      paddingRight: horizontalPadding,
      height,
      verticalLabelRotation,
      horizontalLabelRotation,
      verticalLabelsHeight:
        props.chartConfig.verticalLabelsHeight || DEFAULT_X_LABELS_HEIGHT,
      switchYLabelHeight: props.chartConfig.switchYLabelHeight,
      verticalLabelsHeightPercentage: props.chartConfig.verticalLabelsHeight,
      barRadius: (props.chartConfig && props.chartConfig.barRadius) || 0,
      decimalPlaces:
        (props.chartConfig && props.chartConfig.decimalPlaces) ?? 2,
      formatYLabel:
        (props.chartConfig && props.chartConfig.formatYLabel) ||
        function(label) {
          return label;
        },
      formatXLabel:
        (props.chartConfig && props.chartConfig.formatXLabel) ||
        function(label) {
          return label;
        }
    };

    const defs = useMemo(
      () =>
        baseChart.renderDefs({
          ...config,
          ...props.chartConfig
        }),
      [config, props.chartConfig]
    );

    const colors = useMemo(
      () =>
        renderColors({
          ...props.chartConfig,
          flatColor: flatColor,
          data: props.data.datasets
        }),
      [props.chartConfig, flatColor, props.data.datasets]
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
      [height, props.chartConfig]
    );

    const innerLines = useMemo(
      () =>
        withInnerLines
          ? baseChart.renderHorizontalLines({
              ...config,
              count: segments,
              paddingTop
            })
          : null,
      [
        withInnerLines,
        baseChart.renderHorizontalLines,
        config,
        segments,
        paddingTop
      ]
    );

    const verticalLabels = useMemo(
      () =>
        withVerticalLabels
          ? baseChart.renderVerticalLabels({
              ...config,
              highlightIndex: highlightIndex,
              onPress: ({ index }) => {
                setHighlightIndex(index);
                //@ts-ignore
                onBarPress({ index });
              },
              labels: data.labels,
              paddingTop: paddingTop as number,
              horizontalOffset: (baseBarWidth * barPercentage) / 2
            })
          : null,
      [
        highlightIndex,
        withVerticalLabels,
        baseChart.renderVerticalLabels,
        onBarPress,
        data.labels,
        paddingTop,
        baseBarWidth,
        barPercentage
      ]
    );

    const bars = useMemo(
      () =>
        renderBars({
          ...config,
          data: data.datasets[0].data,
          paddingTop: paddingTop as number,
          withCustomBarColorFromData: withCustomBarColorFromData
        }),
      [config, data.datasets[0], paddingTop, withCustomBarColorFromData]
    );

    const valuesOnBars = useMemo(
      () =>
        showValuesOnTopOfBars &&
        renderValuesOnTopOfBars({
          ...config,
          data: data.datasets[0].data,
          paddingTop: paddingTop as number
        }),
      [config, data.datasets[0], paddingTop]
    );

    const barTops = useMemo(
      () =>
        showBarTops &&
        renderBarTops({
          ...config,
          data: data.datasets[0].data,
          paddingTop: paddingTop as number
        }),
      [config, data.datasets[0], paddingTop]
    );

    const decoration = useMemo(
      () =>
        decorator &&
        decorator({
          ...config,
          data: data.datasets[0].data,
          paddingTop
        }),
      [config, data.datasets[0], paddingTop]
    );

    const horizontalLabels = useMemo(
      () =>
        withHorizontalLabels
          ? baseChart.renderHorizontalLabels({
              ...config,
              count: segments,
              data: data.datasets[0].data,
              width: yLabelsWidth,
              paddingTop: paddingTop as number
            })
          : null,
      [
        baseChart.renderHorizontalLabels,
        config,
        segments,
        data.datasets[0].data,
        yLabelsWidth,
        paddingTop,
        yLabelsWidth
      ]
    );

    // determine same spacing on the right side of the chart

    return (
      <View style={[style, { flexDirection: "row" }]}>
        <View>
          <Svg height={height} width={yLabelsWidth}>
            {/* {defs} */}
            {/* {rect} */}
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
            {colors}
            {rect}
            <G>{innerLines}</G>
            <G>{verticalLabels}</G>
            <G>{bars}</G>
            <G>{valuesOnBars}</G>
            <G>{barTops}</G>
            <G>{decoration}</G>
          </Svg>
        </Animated.ScrollView>
      </View>
    );
    // }
  }
);

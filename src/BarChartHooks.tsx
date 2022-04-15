import React, { RefObject } from "react";
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
  DEFAULT_X_LABELS_HEIGHT
} from "./AbstractHooks";
import { ChartData } from "./HelperTypes";

const barWidth = 32;

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
}

export default React.forwardRef(
  (props: BarChartProps, ref: RefObject<Animated.ScrollView>) => {
    const baseChart = useBaseChart(props);

    const getBarPercentage = () => {
      const { barPercentage = 1 } = props.chartConfig;
      return barPercentage;
    };

    const renderBars = ({
      data,
      width,
      height,
      paddingTop,
      paddingRight,
      barRadius,
      withCustomBarColorFromData,
      onBarPress,
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
      onBarPress: BarChartProps["onBarPress"];
    }) => {
      height = height - verticalLabelsHeight;
      const baseHeight = baseChart.calcBaseHeight(data, height);

      return data.map((x, i) => {
        const barHeight = baseChart.calcHeight(x, data, height);
        const barWidth = 32 * getBarPercentage();

        const cx =
          paddingRight +
          (i * (width - paddingRight)) / data.length +
          barWidth / 2;
        const cy =
          (barHeight > 0 ? baseHeight - barHeight : baseHeight) + paddingTop;

        const onPress = () => {
          if (!onBarPress) {
            return;
          }

          onBarPress({
            index: i,
            value: x,
            // dataset: data,
            x: cx,
            y: cy
          });
        };

        return (
          <Rect
            key={Math.random()}
            x={cx}
            y={cy}
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
    };

    const renderBarTops = ({
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

      return data.map((x, i) => {
        const barHeight = baseChart.calcHeight(x, data, height);
        const barWidth = 32 * getBarPercentage();
        return (
          <Rect
            key={Math.random()}
            x={
              paddingRight +
              (i * (width - paddingRight)) / data.length +
              barWidth / 2
            }
            y={(baseHeight - barHeight) * verticalLabelsHeight + paddingTop}
            width={barWidth}
            height={2}
            fill={props.chartConfig.color(0.6)}
          />
        );
      });
    };

    const renderColors = ({
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
                <Stop offset="0" stopColor={highOpacityColor} stopOpacity="1" />
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
    };

    const renderValuesOnTopOfBars = ({
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
        const barWidth = 32 * getBarPercentage();
        return (
          <Text
            key={Math.random()}
            x={
              paddingRight +
              (i * (width - paddingRight)) / data.length +
              barWidth / 1
            }
            y={baseHeight - barHeight + paddingTop - 2}
            fill={props.chartConfig.color(0.6)}
            fontSize="12"
            textAnchor="middle"
          >
            {renderLabel(data[i])}
          </Text>
        );
      });
    };

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

    const { borderRadius = 0, paddingTop = 16, paddingRight = 0 } = style;

    const config = {
      width: width,
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

    return (
      <View style={[style, { flexDirection: "row" }]}>
        <View>
          <Svg height={height} width={yLabelsWidth}>
            {baseChart.renderDefs({
              ...config,
              ...props.chartConfig
            })}
            <Rect
              width="100%"
              height={height}
              fill={
                props.chartConfig.backgroundColor
                  ? props.chartConfig.backgroundColor
                  : "url(#backgroundGradient)"
              }
            />
            <G>
              {withHorizontalLabels
                ? baseChart.renderHorizontalLabels({
                    ...config,
                    count: segments,
                    data: data.datasets[0].data,
                    width: yLabelsWidth,
                    paddingTop: paddingTop as number,
                    paddingRight: yLabelsWidth as number
                  })
                : null}
            </G>
          </Svg>
        </View>
        <Animated.ScrollView
          ref={ref}
          horizontal={true}
          bounces={false}
          {...scrollViewProps}
        >
          <Svg height={height} width={width}>
            {baseChart.renderDefs({
              ...config,
              ...props.chartConfig
            })}
            {renderColors({
              ...props.chartConfig,
              flatColor: flatColor,
              data: props.data.datasets
            })}
            <Rect
              width="100%"
              height={height}
              // rx={borderRadius}
              // ry={borderRadius}
              fill={
                props.chartConfig.backgroundColor
                  ? props.chartConfig.backgroundColor
                  : "url(#backgroundGradient)"
              }
            />
            <G>
              {withInnerLines
                ? baseChart.renderHorizontalLines({
                    ...config,
                    count: segments,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            <G>
              {withVerticalLabels
                ? baseChart.renderVerticalLabels({
                    ...config,
                    onPress: onBarPress,
                    labels: data.labels,
                    paddingRight: paddingRight as number,
                    paddingTop: paddingTop as number,
                    horizontalOffset: barWidth * getBarPercentage()
                  })
                : null}
            </G>
            <G>
              {renderBars({
                ...config,
                data: data.datasets[0].data,
                paddingTop: paddingTop as number,
                paddingRight: paddingRight as number,
                withCustomBarColorFromData: withCustomBarColorFromData,
                onBarPress: onBarPress
              })}
            </G>
            <G>
              {showValuesOnTopOfBars &&
                renderValuesOnTopOfBars({
                  ...config,
                  data: data.datasets[0].data,
                  paddingTop: paddingTop as number,
                  paddingRight: paddingRight as number
                })}
            </G>
            <G>
              {showBarTops &&
                renderBarTops({
                  ...config,
                  data: data.datasets[0].data,
                  paddingTop: paddingTop as number,
                  paddingRight: paddingRight as number
                })}
            </G>
            <G>
              {decorator &&
                decorator({
                  ...config,
                  data: data.datasets[0].data,
                  paddingTop,
                  paddingRight
                })}
            </G>
          </Svg>
        </Animated.ScrollView>
      </View>
    );
    // }
  }
);

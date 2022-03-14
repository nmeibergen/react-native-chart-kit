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
  InvertedChart,
  AbstractChartConfig,
  AbstractChartProps,
  DEFAULT_Y_LABELS_WIDTH,
  DEFAULT_X_LABELS_HEIGHT
} from "./AbstractChart";
import { ChartData } from "./HelperTypes";

const barWidth = 32;

export interface HorizontalBarChartProps extends AbstractChartProps {
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
  // xLabelsHeight?: number;
  scrollViewProps?: AnimateProps<ScrollViewProps>;

  segments?: number;
  showBarTops?: boolean;
  showValuesOnTopOfBars?: boolean;
  withCustomBarColorFromData?: boolean;
  flatColor?: boolean;
}

interface BarChartRefProps extends HorizontalBarChartProps {
  scrollViewRef: RefObject<Animated.ScrollView>;
}

type BarChartState = {};

export class HorizontalBarChart extends InvertedChart<
  BarChartRefProps,
  BarChartState
> {
  getBarPercentage = () => {
    const { barPercentage = 1 } = this.props.chartConfig;
    return barPercentage;
  };
  renderBars = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    barRadius,
    withCustomBarColorFromData,
    onBarPress,
    horizontalLabelsWidth
  }: Pick<
    Omit<AbstractChartConfig, "data">,
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "barRadius"
    | "horizontalLabelsWidth"
  > & {
    data: number[];
    withCustomBarColorFromData: boolean;
    onBarPress: HorizontalBarChartProps["onBarPress"];
  }) => {
    // Doesn't work yet for negative values in the chart...

    // const baseWidth = this.calcBaseHeight(data, width);
    const baseWidth =
      paddingRight + (horizontalLabelsWidth || DEFAULT_Y_LABELS_WIDTH);
    return data.map((x, i) => {
      const barWidth = this.calcHeight(
        x,
        data,
        width - (horizontalLabelsWidth || DEFAULT_Y_LABELS_WIDTH)
      );
      const barHeight = 32 * this.getBarPercentage();
      const cy =
        paddingTop + (i * (height - paddingTop)) / data.length + barHeight / 2;
      const cx = baseWidth;
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
      console.log({ cx });
      console.log({ cy });
      return (
        <Rect
          key={Math.random()}
          x={cx}
          y={cy}
          rx={barRadius}
          width={Math.abs(barWidth)}
          height={barHeight}
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
  renderBarTops = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
  }: Pick<
    Omit<AbstractChartConfig, "data">,
    "width" | "height" | "paddingRight" | "paddingTop" | "verticalLabelsHeight"
  > & {
    data: number[];
  }) => {
    // const baseHeight = this.calcBaseHeight(data, height);
    // return data.map((x, i) => {
    //     const barHeight = this.calcHeight(x, data, height);
    //     const barWidth = 32 * this.getBarPercentage();
    //     return (
    //         <Rect
    //             key={Math.random()}
    //             x={
    //                 paddingRight +
    //                 (i * (width - paddingRight)) / data.length +
    //                 barWidth / 2
    //             }
    //             y={
    //                 (baseHeight - barHeight) *
    //                 (verticalLabelsHeightPercentage ||
    //                     DEFAULT_X_LABELS_HEIGHT_PERCENTAGE) +
    //                 paddingTop
    //             }
    //             width={barWidth}
    //             height={2}
    //             fill={this.props.chartConfig.color(0.6)}
    //         />
    //     );
    // });
  };
  renderColors = ({
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
                <Stop offset="1" stopColor={highOpacityColor} stopOpacity="1" />
              ) : (
                <Stop offset="1" stopColor={lowOpacityColor} stopOpacity="0" />
              )}
            </LinearGradient>
          );
        })}
      </Defs>
    ));
  };
  renderValuesOnTopOfBars = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
  }: Pick<
    Omit<AbstractChartConfig, "data">,
    "width" | "height" | "paddingRight" | "paddingTop" | "verticalLabelsHeight"
  > & {
    data: number[];
  }) => {
    // const baseHeight = this.calcBaseHeight(data, height);
    // const renderLabel = (value: number) => {
    //     if (this.props.chartConfig.formatTopBarValue) {
    //         return this.props.chartConfig.formatTopBarValue(value);
    //     } else {
    //         return value;
    //     }
    // };
    // return data.map((x, i) => {
    //     const barHeight = this.calcHeight(x, data, height);
    //     const barWidth = 32 * this.getBarPercentage();
    //     return (
    //         <Text
    //             key={Math.random()}
    //             x={
    //                 paddingRight +
    //                 (i * (width - paddingRight)) / data.length +
    //                 barWidth / 1
    //             }
    //             y={
    //                 (baseHeight - barHeight) *
    //                 (verticalLabelsHeightPercentage ||
    //                     DEFAULT_X_LABELS_HEIGHT_PERCENTAGE) +
    //                 paddingTop -
    //                 2
    //             }
    //             fill={this.props.chartConfig.color(0.6)}
    //             fontSize="12"
    //             textAnchor="middle"
    //         >
    //             {renderLabel(data[i])}
    //         </Text>
    //     );
    // });
  };
  render() {
    const {
      width,
      height,
      data,
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
      scrollViewProps = {},
      scrollViewRef
    } = this.props;
    const { borderRadius = 0, paddingTop = 16, paddingRight = 0 } = style;
    const config = {
      width: width,
      height,
      verticalLabelRotation,
      horizontalLabelRotation,
      horizontalLabelsWidth: this.props.chartConfig.horizontalLabelsWidth,
      switchYLabelHeight: this.props.chartConfig.switchYLabelHeight,
      verticalLabelsHeight: this.props.chartConfig.verticalLabelsHeight,
      barRadius:
        (this.props.chartConfig && this.props.chartConfig.barRadius) || 0,
      decimalPlaces:
        (this.props.chartConfig && this.props.chartConfig.decimalPlaces) ?? 2,
      formatYLabel:
        (this.props.chartConfig && this.props.chartConfig.formatYLabel) ||
        function(label) {
          return label;
        },
      formatXLabel:
        (this.props.chartConfig && this.props.chartConfig.formatXLabel) ||
        function(label) {
          return label;
        }
    };

    return (
      <View style={[style, { flexDirection: "row" }]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal={false}
          bounces={false}
          {...scrollViewProps}
        >
          <Svg height={height} width={width}>
            {this.renderDefs({
              ...config,
              ...this.props.chartConfig
            })}
            {this.renderColors({
              ...this.props.chartConfig,
              flatColor: flatColor,
              data: this.props.data.datasets
            })}

            <Rect
              width="100%"
              height={height}
              fill={
                "#000"
                // this.props.chartConfig.backgroundColor
                //     ? this.props.chartConfig.backgroundColor
                //     : "url(#backgroundGradient)"
              }
            />
            <G>
              {withInnerLines
                ? this.renderVerticalLines({
                    ...config,
                    count: segments,
                    paddingTop,
                    paddingRight
                  })
                : null}
            </G>
            {/* 
                        <G>
                            {withHorizontalLabels
                                ? this.renderHorizontalLabels({
                                    ...config,
                                    onPress: onBarPress,
                                    labels: data.labels,
                                    paddingRight: paddingRight as number,
                                    paddingTop: paddingTop as number,
                                    // horizontalOffset: barWidth * this.getBarPercentage()
                                })
                                : null}
                        </G>
                        <G>
                            {this.renderBars({
                                ...config,
                                data: data.datasets[0].data,
                                paddingTop: paddingTop as number,
                                paddingRight: paddingRight as number,
                                withCustomBarColorFromData: withCustomBarColorFromData,
                                onBarPress: onBarPress
                            })}
                        </G> */}
            {/* <G>
                            {showValuesOnTopOfBars &&
                                this.renderValuesOnTopOfBars({
                                    ...config,
                                    data: data.datasets[0].data,
                                    paddingTop: paddingTop as number,
                                    paddingRight: paddingRight as number
                                })}
                        </G>
                        <G>
                            {showBarTops &&
                                this.renderBarTops({
                                    ...config,
                                    data: data.datasets[0].data,
                                    paddingTop: paddingTop as number,
                                    paddingRight: paddingRight as number
                                })}
                        </G> */}
            {/* <G>
                            {decorator &&
                                decorator({
                                    ...config,
                                    data: data.datasets[0].data,
                                    paddingTop,
                                    paddingRight
                                })}
                        </G> */}
            <Text
              origin={"30,30"}
              x={30}
              y={30}
              textAnchor="start"
              fill={"#ff0000"}
            >
              Fantastisch
            </Text>
          </Svg>
        </Animated.ScrollView>
        {/* <View>
                    <Svg width={width} height={xLabelsHeight}>
                        {this.renderDefs({
                            ...config,
                            ...this.props.chartConfig
                        })}
                        <Rect
                            width="100%"
                            height={height}
                            fill={
                                this.props.chartConfig.backgroundColor
                                    ? this.props.chartConfig.backgroundColor
                                    : "url(#backgroundGradient)"
                            }
                        />
                        <G>
                            {withVerticalLabels
                                ? this.renderVerticalLabels({
                                    ...config,
                                    count: segments,
                                    data: data.datasets[0].data,
                                    paddingTop: paddingTop as number,
                                    paddingRight: xLabelsHeight as number
                                })
                                : null
                            }
                        </G>
                    </Svg>
                </View> */}
      </View>
    );
  }
}

export default React.forwardRef(
  (props: HorizontalBarChartProps, ref: RefObject<Animated.ScrollView>) => (
    <HorizontalBarChart scrollViewRef={ref} {...props} />
  )
);

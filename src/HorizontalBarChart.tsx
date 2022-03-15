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
    horizontalLabelsWidth = DEFAULT_Y_LABELS_WIDTH
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

    width = width - horizontalLabelsWidth;

    // const baseWidth = this.calcBaseHeight(data, width);
    const baseWidth = horizontalLabelsWidth;
    return data.map((x, i) => {
      const barWidth = this.calcHeight(x, data, width);
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
    horizontalLabelsWidth = DEFAULT_Y_LABELS_WIDTH,
    verticalOffset = 0
  }: Pick<
    Omit<AbstractChartConfig, "data">,
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "horizontalLabelsWidth"
    | "verticalOffset"
  > & {
    data: number[];
  }) => {
    const fontSize = 12;

    const renderLabel = (value: number) => {
      if (this.props.chartConfig.formatTopBarValue) {
        return this.props.chartConfig.formatTopBarValue(value);
      } else {
        return value;
      }
    };

    width = width - horizontalLabelsWidth;

    const baseWidth = horizontalLabelsWidth;
    return data.map((x, i) => {
      const barWidth = this.calcHeight(x, data, width);
      const barHeight = 32 * this.getBarPercentage();
      const cy =
        paddingTop + (i * (height - paddingTop)) / data.length + barHeight / 2;
      const cx = baseWidth;
      return (
        <Text
          key={Math.random()}
          x={cx + barWidth + 2}
          y={cy + verticalOffset + fontSize / 2}
          fill={this.props.chartConfig.color(0.6)}
          fontSize={fontSize}
          textAnchor="start"
        >
          {renderLabel(data[i])}
        </Text>
      );
    });
  };
  render() {
    const {
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
    const { paddingTop = 0, paddingRight = 0 } = style;

    // Width
    const fullWidth = this.props.width || 200;
    const width = fullWidth - 40; // this is to account for spacing on the right side

    // Height
    const verticalLabelsHeight =
      this.props.chartConfig.verticalLabelsHeight || 16;
    const graphHeight = height - verticalLabelsHeight;

    const config = {
      width: width,
      height: graphHeight,
      verticalLabelRotation,
      horizontalLabelRotation,
      verticalLabelsHeight,
      horizontalLabelsWidth: this.props.chartConfig.horizontalLabelsWidth,
      switchYLabelHeight: this.props.chartConfig.switchYLabelHeight,
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

    const graphContainerHeight = ((style && style.height) || 220) as number;

    return (
      <View style={[style, { height: graphContainerHeight }]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal={false}
          bounces={false}
          nestedScrollEnabled={true}
          style={{ height: graphContainerHeight - verticalLabelsHeight }}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          <Svg height={graphHeight} width={fullWidth}>
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
              height={graphHeight}
              fill={
                this.props.chartConfig.backgroundColor
                  ? this.props.chartConfig.backgroundColor
                  : "url(#backgroundGradient)"
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
            <G>
              {withHorizontalLabels
                ? this.renderHorizontalLabels({
                    ...config,
                    onPress: onBarPress,
                    labels: data.labels,
                    paddingRight: paddingRight as number,
                    paddingTop: paddingTop as number,
                    verticalOffset: barWidth * this.getBarPercentage()
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
            </G>
            <G>
              {showValuesOnTopOfBars &&
                this.renderValuesOnTopOfBars({
                  ...config,
                  data: data.datasets[0].data,
                  paddingTop: paddingTop as number,
                  paddingRight: paddingRight as number,
                  verticalOffset: (barWidth * this.getBarPercentage()) / 2
                })}
            </G>
            {/* 
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
          </Svg>
        </Animated.ScrollView>
        <View style={{ height: config.verticalLabelsHeight }}>
          <Svg width={fullWidth} height={config.verticalLabelsHeight}>
            {/* {this.renderDefs({
                            ...config,
                            ...this.props.chartConfig
                        })}
                        <Rect
                            width="100%"
                            height={config.verticalLabelsHeight}
                            fill={
                                this.props.chartConfig.backgroundColor
                                    ? this.props.chartConfig.backgroundColor
                                    : "url(#backgroundGradient)"
                            }
                        /> */}
            <G>
              {withVerticalLabels
                ? this.renderVerticalLabels({
                    ...config,
                    count: segments,
                    data: data.datasets[0].data,
                    paddingTop: paddingTop as number
                    // paddingRight: config.horizontalLabelsWidth as number
                  })
                : null}
            </G>
          </Svg>
        </View>
      </View>
    );
  }
}

export default React.forwardRef(
  (props: HorizontalBarChartProps, ref: RefObject<Animated.ScrollView>) => (
    <HorizontalBarChart scrollViewRef={ref} {...props} />
  )
);

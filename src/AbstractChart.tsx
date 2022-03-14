import React, { Component } from "react";
import { Defs, Line, LinearGradient, Stop, Text } from "react-native-svg";

import { ChartConfig, Dataset, PartialBy } from "./HelperTypes";

export interface AbstractChartProps {
  fromZero?: boolean;
  fromNumber?: number;
  chartConfig?: AbstractChartConfig;
  yAxisLabel?: string;
  yAxisSuffix?: string;
  xAxisSuffix?: string;
  yLabelsOffset?: number;
  yAxisInterval?: number;
  xAxisLabel?: string;
  xLabelsOffset?: number;
  hidePointsAtIndex?: number[];
  yLabelsWidth?: number;
  // xLabelsHeight?: number;
}

export interface AbstractChartConfig extends ChartConfig {
  count?: number;
  data?: Dataset[];
  width?: number;
  height?: number;
  paddingTop?: number;
  paddingRight?: number;
  horizontalLabelRotation?: number;
  formatYLabel?: (yLabel: string) => string;
  labels?: string[];
  horizontalOffset?: number;
  verticalOffset?: number;
  stackedBar?: boolean;
  verticalLabelRotation?: number;
  formatXLabel?: (xLabel: string) => string;
  verticalLabelsHeight?: number;
  horizontalLabelsWidth?: number;
  switchYLabelHeight?: number;
  formatTopBarValue?: (topBarValue: number) => string | number;
  onPress?: (data: any) => void;
}

export type AbstractChartState = {};

export const DEFAULT_X_LABELS_HEIGHT = 20; // percentage from top
export const DEFAULT_Y_LABELS_WIDTH = 64; // percentage from left

class AbstractChart<
  IProps extends AbstractChartProps,
  IState extends AbstractChartState
> extends Component<AbstractChartProps & IProps, AbstractChartState & IState> {
  calcScaler = (data: number[]) => {
    if (this.props.fromZero && this.props.fromNumber) {
      return (
        Math.max(...data, this.props.fromNumber) - Math.min(...data, 0) || 1
      );
    } else if (this.props.fromZero) {
      return Math.max(...data, 0) - Math.min(...data, 0) || 1;
    } else if (this.props.fromNumber) {
      return (
        Math.max(...data, this.props.fromNumber) -
          Math.min(...data, this.props.fromNumber) || 1
      );
    } else {
      return Math.max(...data) - Math.min(...data) || 1;
    }
  };

  calcBaseHeight = (data: number[], height: number) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    if (min >= 0 && max >= 0) {
      return height;
    } else if (min < 0 && max <= 0) {
      return 0;
    } else if (min < 0 && max > 0) {
      return (height * max) / this.calcScaler(data);
    }
  };

  calcHeight = (val: number, data: number[], height: number) => {
    const max = Math.max(...data);
    const min = Math.min(...data);

    if (min < 0 && max > 0) {
      return height * (val / this.calcScaler(data));
    } else if (min >= 0 && max >= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - min) / this.calcScaler(data));
    } else if (min < 0 && max <= 0) {
      return this.props.fromZero
        ? height * (val / this.calcScaler(data))
        : height * ((val - max) / this.calcScaler(data));
    }
  };

  getPropsForBackgroundLines() {
    const { propsForBackgroundLines = {} } = this.props.chartConfig;
    return {
      stroke: this.props.chartConfig.color(0.2),
      strokeDasharray: "5, 10",
      strokeWidth: 1,
      ...propsForBackgroundLines
    };
  }

  getPropsForLabels() {
    const {
      propsForLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fontSize: 12,
      fill: labelColor(0.8),
      ...propsForLabels
    };
  }

  getPropsForVerticalLabels() {
    const {
      propsForVerticalLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fill: labelColor(0.8),
      ...propsForVerticalLabels
    };
  }

  getPropsForHorizontalLabels() {
    const {
      propsForHorizontalLabels = {},
      color,
      labelColor = color
    } = this.props.chartConfig;
    return {
      fill: labelColor(0.8),
      ...propsForHorizontalLabels
    };
  }

  renderDefs = (
    config: Pick<
      PartialBy<
        AbstractChartConfig,
        | "backgroundGradientFromOpacity"
        | "backgroundGradientToOpacity"
        | "fillShadowGradient"
        | "fillShadowGradientOpacity"
        | "fillShadowGradientFrom"
        | "fillShadowGradientFromOpacity"
        | "fillShadowGradientFromOffset"
        | "fillShadowGradientTo"
        | "fillShadowGradientToOpacity"
        | "fillShadowGradientToOffset"
      >,
      | "width"
      | "height"
      | "backgroundGradientFrom"
      | "backgroundGradientTo"
      | "useShadowColorFromDataset"
      | "data"
      | "backgroundGradientFromOpacity"
      | "backgroundGradientToOpacity"
      | "fillShadowGradient"
      | "fillShadowGradientOpacity"
      | "fillShadowGradientFrom"
      | "fillShadowGradientFromOpacity"
      | "fillShadowGradientFromOffset"
      | "fillShadowGradientTo"
      | "fillShadowGradientToOpacity"
      | "fillShadowGradientToOffset"
    >
  ) => {
    const {
      width,
      height,
      backgroundGradientFrom,
      backgroundGradientTo,
      useShadowColorFromDataset,
      data
    } = config;

    const fromOpacity = config.hasOwnProperty("backgroundGradientFromOpacity")
      ? config.backgroundGradientFromOpacity
      : 1.0;
    const toOpacity = config.hasOwnProperty("backgroundGradientToOpacity")
      ? config.backgroundGradientToOpacity
      : 1.0;

    const fillShadowGradient = config.hasOwnProperty("fillShadowGradient")
      ? config.fillShadowGradient
      : this.props.chartConfig.color(1.0);

    const fillShadowGradientOpacity = config.hasOwnProperty(
      "fillShadowGradientOpacity"
    )
      ? config.fillShadowGradientOpacity
      : 0.1;

    const fillShadowGradientFrom = config.hasOwnProperty(
      "fillShadowGradientFrom"
    )
      ? config.fillShadowGradientFrom
      : fillShadowGradient;

    const fillShadowGradientFromOpacity = config.hasOwnProperty(
      "fillShadowGradientFromOpacity"
    )
      ? config.fillShadowGradientFromOpacity
      : fillShadowGradientOpacity;

    const fillShadowGradientFromOffset = config.hasOwnProperty(
      "fillShadowGradientFromOffset"
    )
      ? config.fillShadowGradientFromOffset
      : 0;

    const fillShadowGradientTo = config.hasOwnProperty("fillShadowGradientTo")
      ? config.fillShadowGradientTo
      : this.props.chartConfig.color(1.0);

    const fillShadowGradientToOpacity = config.hasOwnProperty(
      "fillShadowGradientToOpacity"
    )
      ? config.fillShadowGradientToOpacity
      : 0.1;

    const fillShadowGradientToOffset = config.hasOwnProperty(
      "fillShadowGradientToOffset"
    )
      ? config.fillShadowGradientToOffset
      : 1;

    return (
      <Defs>
        <LinearGradient
          id="backgroundGradient"
          x1={0}
          y1={height}
          x2={width}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop
            offset="0"
            stopColor={backgroundGradientFrom}
            stopOpacity={fromOpacity}
          />
          <Stop
            offset="1"
            stopColor={backgroundGradientTo}
            stopOpacity={toOpacity}
          />
        </LinearGradient>
        {useShadowColorFromDataset ? (
          data.map((dataset, index) => (
            <LinearGradient
              id={`fillShadowGradientFrom_${index}`}
              key={`${index}`}
              x1={0}
              y1={0}
              x2={0}
              y2={height}
              gradientUnits="userSpaceOnUse"
            >
              <Stop
                offset={fillShadowGradientFromOffset}
                stopColor={
                  dataset.color ? dataset.color(1.0) : fillShadowGradientFrom
                }
                stopOpacity={fillShadowGradientFromOpacity}
              />
              <Stop
                offset={fillShadowGradientToOffset}
                stopColor={
                  dataset.color
                    ? dataset.color(fillShadowGradientFromOpacity)
                    : fillShadowGradientFrom
                }
                stopOpacity={fillShadowGradientToOpacity || 0}
              />
            </LinearGradient>
          ))
        ) : (
          <LinearGradient
            id="fillShadowGradientFrom"
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset={fillShadowGradientFromOffset}
              stopColor={fillShadowGradientFrom}
              stopOpacity={fillShadowGradientFromOpacity}
            />
            <Stop
              offset={fillShadowGradientToOffset}
              stopColor={fillShadowGradientTo || fillShadowGradientFrom}
              stopOpacity={fillShadowGradientToOpacity || 0}
            />
          </LinearGradient>
        )}
      </Defs>
    );
  };
}

export class BaseChart<
  IProps extends AbstractChartProps,
  IState extends AbstractChartState
> extends AbstractChart<
  AbstractChartProps & IProps,
  AbstractChartState & IState
> {
  renderHorizontalLines = config => {
    const {
      count,
      width,
      height,
      paddingTop,
      // paddingRight,
      verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
    } = config;
    const basePosition = height - verticalLabelsHeight;
    console.log({ paddingTop });

    return [...new Array(count + 1)].map((_, i) => {
      const paddingRight = 0;
      const y = (basePosition / count) * i + paddingTop;
      console.log({ y });
      return (
        <Line
          key={Math.random()}
          x1={paddingRight}
          y1={y}
          x2={width}
          y2={y}
          {...this.getPropsForBackgroundLines()}
        />
      );
    });
  };

  renderHorizontalLine = config => {
    const {
      width,
      height,
      paddingTop,
      // paddingRight,
      verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
    } = config;

    // PaddingRight should only happen for the labels and chart, not the lines inside the chart.
    const paddingRight = 0;

    return (
      <Line
        key={Math.random()}
        x1={paddingRight}
        y1={height - verticalLabelsHeight + paddingTop}
        x2={width}
        y2={height - verticalLabelsHeight + paddingTop}
        {...this.getPropsForBackgroundLines()}
      />
    );
  };

  renderHorizontalLabels = (
    config: Omit<AbstractChartConfig, "data"> & { data: number[] }
  ) => {
    const {
      count,
      data,
      height,
      paddingTop,
      paddingRight,
      horizontalLabelRotation = 0,
      decimalPlaces = 2,
      formatYLabel = (yLabel: string) => yLabel,
      verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
    } = config;

    const {
      yAxisLabel = "",
      yAxisSuffix = "",
      yLabelsOffset = 12
    } = this.props;
    return new Array(count === 1 ? 1 : count + 1).fill(1).map((_, i) => {
      let yLabel = String(i * count);

      if (count === 1) {
        yLabel = `${yAxisLabel}${formatYLabel(
          data[0].toFixed(decimalPlaces)
        )}${yAxisSuffix}`;
      } else {
        const label = this.props.fromZero
          ? (this.calcScaler(data) / count) * i + Math.min(...data, 0)
          : (this.calcScaler(data) / count) * i + Math.min(...data);
        yLabel = `${yAxisLabel}${formatYLabel(
          label.toFixed(decimalPlaces)
        )}${yAxisSuffix}`;
      }

      const basePosition = height - verticalLabelsHeight;
      console.log({ basePosition });
      const x = paddingRight - yLabelsOffset;
      const y =
        count === 1 && this.props.fromZero
          ? paddingTop + 4
          : height -
            verticalLabelsHeight -
            (basePosition / count) * i +
            paddingTop;
      return (
        <Text
          rotation={horizontalLabelRotation}
          origin={`${x}, ${y}`}
          key={Math.random()}
          x={x}
          textAnchor="end"
          y={y}
          {...this.getPropsForLabels()}
          {...this.getPropsForHorizontalLabels()}
        >
          {yLabel}
        </Text>
      );
    });
  };

  renderVerticalLabels = ({
    labels = [],
    width,
    height,
    paddingRight,
    paddingTop,
    horizontalOffset = 0,
    stackedBar = false,
    verticalLabelRotation = 0,
    formatXLabel = xLabel => xLabel,
    switchYLabelHeight = 0,
    verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT,
    onPress = () => {}
  }: Pick<
    AbstractChartConfig,
    | "labels"
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "horizontalOffset"
    | "stackedBar"
    | "verticalLabelRotation"
    | "formatXLabel"
    | "switchYLabelHeight"
    | "verticalLabelsHeight"
    | "onPress"
  >) => {
    const {
      xAxisLabel = "",
      xLabelsOffset = 0,
      hidePointsAtIndex = []
    } = this.props;

    const fontSize = 12;

    let fac = 1;
    if (stackedBar) {
      fac = 0.71;
    }

    return labels.map((label, i) => {
      if (hidePointsAtIndex.includes(i)) {
        return null;
      }

      const graphBottom = height - verticalLabelsHeight + paddingTop;

      const x =
        (((width - paddingRight) / labels.length) * i +
          paddingRight +
          horizontalOffset) *
        fac;

      const y = graphBottom + (fontSize * 3) / 2 + xLabelsOffset;

      return (
        <Text
          onPress={() => onPress({ index: i })}
          origin={`${x}, ${y}`}
          rotation={verticalLabelRotation}
          key={Math.random()}
          x={x}
          y={y}
          textAnchor={
            verticalLabelRotation === 0
              ? "middle"
              : verticalLabelRotation < 0
              ? "end"
              : "start"
          }
          {...this.getPropsForLabels()}
          {...this.getPropsForVerticalLabels()}
        >
          {`${formatXLabel(label)}${xAxisLabel}`}
        </Text>
      );
    });
  };

  renderVerticalLines = ({
    data,
    width,
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
  }: Omit<
    Pick<
      AbstractChartConfig,
      | "data"
      | "width"
      | "height"
      | "paddingRight"
      | "paddingTop"
      | "verticalLabelsHeight"
    >,
    "data"
  > & { data: number[] }) => {
    const { yAxisInterval = 1 } = this.props;

    // PaddingRight should only happen for the labels and chart, not the lines inside the chart.
    paddingRight = 0;

    return [...new Array(Math.ceil(data.length / yAxisInterval))].map(
      (_, i) => {
        return (
          <Line
            key={Math.random()}
            x1={Math.floor(
              ((width - paddingRight) / (data.length / yAxisInterval)) * i +
                paddingRight
            )}
            y1={0}
            x2={Math.floor(
              ((width - paddingRight) / (data.length / yAxisInterval)) * i +
                paddingRight
            )}
            y2={height - verticalLabelsHeight + paddingTop}
            {...this.getPropsForBackgroundLines()}
          />
        );
      }
    );
  };

  renderVerticalLine = ({
    height,
    paddingTop,
    paddingRight,
    verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
  }: Pick<
    AbstractChartConfig,
    "height" | "paddingRight" | "paddingTop" | "verticalLabelsHeight"
  >) => (
    <Line
      key={Math.random()}
      x1={Math.floor(paddingRight)}
      y1={0}
      x2={Math.floor(paddingRight)}
      y2={height - verticalLabelsHeight + paddingTop}
      {...this.getPropsForBackgroundLines()}
    />
  );
}

export class InvertedChart<
  IProps extends AbstractChartProps,
  IState extends AbstractChartState
> extends AbstractChart<
  AbstractChartProps & IProps,
  AbstractChartState & IState
> {
  renderVerticalLines = config => {
    const {
      count,
      width,
      height,
      paddingTop,
      paddingRight,
      horizontalLabelsWidth = DEFAULT_Y_LABELS_WIDTH,
      verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
    } = config;
    const baseXPosition = horizontalLabelsWidth + paddingRight;
    const baseYPosition = height - verticalLabelsHeight;

    console.log({ baseXPosition });
    return [...new Array(count + 1)].map((_, i) => {
      const paddingRight = 0;
      const x =
        baseXPosition +
        ((width - horizontalLabelsWidth) / count) * i +
        paddingRight;
      return (
        <Line
          key={Math.random()}
          x1={x}
          y1={paddingTop}
          x2={x}
          y2={baseYPosition}
          {...this.getPropsForBackgroundLines()}
        />
      );
    });
  };

  renderHorizontalLabels = ({
    labels = [],
    width,
    height,
    paddingRight,
    paddingTop,
    verticalOffset = 0,
    stackedBar = false,
    formatXLabel = xLabel => xLabel,
    horizontalLabelsWidth = DEFAULT_Y_LABELS_WIDTH,
    onPress = () => {}
  }: Pick<
    AbstractChartConfig,
    | "labels"
    | "width"
    | "height"
    | "paddingRight"
    | "paddingTop"
    | "verticalOffset"
    | "stackedBar"
    | "verticalLabelRotation"
    | "formatXLabel"
    | "horizontalLabelsWidth"
    | "onPress"
  >) => {
    const {
      yAxisLabel = "",
      yLabelsOffset = 0,
      hidePointsAtIndex = []
    } = this.props;

    return labels.map((label, i) => {
      if (hidePointsAtIndex.includes(i)) {
        return null;
      }

      // const graphBottom = height * verticalLabelsHeight + paddingTop;
      const verticalLabelsWidth = horizontalLabelsWidth;
      const verticalLabelsBaseOffsetFromChart = 15;

      const y =
        ((height - paddingTop) / labels.length) * i +
        paddingTop +
        verticalOffset;

      const x =
        verticalLabelsWidth - verticalLabelsBaseOffsetFromChart + yLabelsOffset;

      return (
        <Text
          onPress={() => onPress({ index: i })}
          origin={`${x}, ${y}`}
          key={Math.random()}
          x={x}
          y={y}
          textAnchor="end"
          {...this.getPropsForLabels()}
          {...this.getPropsForHorizontalLabels()}
        >
          {`${formatXLabel(label)}${yAxisLabel}`}
        </Text>
      );
    });
  };

  renderVerticalLabels = (
    config: Omit<AbstractChartConfig, "data"> & { data: number[] }
  ) => {
    const {
      count,
      data,
      width,
      paddingRight,
      horizontalLabelRotation = 0,
      decimalPlaces = 2,
      formatYLabel = (yLabel: string) => yLabel,
      horizontalLabelsWidth = DEFAULT_Y_LABELS_WIDTH
    } = config;

    const {
      xAxisLabel = "",
      xAxisSuffix = "",
      xLabelsOffset = 12
    } = this.props;
    return new Array(count === 1 ? 1 : count + 1).fill(1).map((_, i) => {
      let xLabel = String(i * count);

      if (count === 1) {
        xLabel = `${xAxisLabel}${formatYLabel(
          data[0].toFixed(decimalPlaces)
        )}${xAxisSuffix}`;
      } else {
        const label = this.props.fromZero
          ? (this.calcScaler(data) / count) * i + Math.min(...data, 0)
          : (this.calcScaler(data) / count) * i + Math.min(...data);
        xLabel = `${xAxisLabel}${formatYLabel(
          label.toFixed(decimalPlaces)
        )}${xAxisSuffix}`;
      }

      const basePosition = horizontalLabelsWidth;
      const y = paddingRight - xLabelsOffset;
      const x =
        count === 1 && this.props.fromZero
          ? paddingRight + 4
          : basePosition + (basePosition / count) * i + paddingRight;
      return (
        <Text
          rotation={horizontalLabelRotation}
          origin={`${x}, ${y}`}
          key={Math.random()}
          x={x}
          textAnchor="middle"
          y={y}
          {...this.getPropsForLabels()}
          {...this.getPropsForHorizontalLabels()}
        >
          {xLabel}
        </Text>
      );
    });
  };
}

import React, { Component, useCallback } from "react";
import {
  Defs,
  G,
  Line,
  LinearGradient,
  Rect,
  Stop,
  Text,
  TSpan
} from "react-native-svg";

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
  highlightColor?: string;
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
  barWidth?: number;
  formatYLabel?: (yLabel: string) => string;
  labels?: (string | string[])[];
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
export const BAR_WIDTH = 32;

export const useAbstractChart = (props: AbstractChartProps & any) => {
  const calcScaler = useCallback(
    (data: number[]) => {
      if (props.fromZero && props.fromNumber) {
        return Math.max(...data, props.fromNumber) - Math.min(...data, 0) || 1;
      } else if (props.fromZero) {
        return Math.max(...data, 0) - Math.min(...data, 0) || 1;
      } else if (props.fromNumber) {
        return (
          Math.max(...data, props.fromNumber) -
            Math.min(...data, props.fromNumber) || 1
        );
      } else {
        return Math.max(...data) - Math.min(...data) || 1;
      }
    },
    [props.fromNumber, props.fromZero]
  );

  const calcBaseHeight = useCallback((data: number[], height: number) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    if (min >= 0 && max >= 0) {
      return height;
    } else if (min < 0 && max <= 0) {
      return 0;
    } else if (min < 0 && max > 0) {
      return (height * max) / calcScaler(data);
    }
  }, []);

  const calcHeight = useCallback(
    (val: number, data: number[], height: number) => {
      const max = Math.max(...data);
      const min = Math.min(...data);

      if (min < 0 && max > 0) {
        return height * (val / calcScaler(data));
      } else if (min >= 0 && max >= 0) {
        return props.fromZero
          ? height * (val / calcScaler(data))
          : height * ((val - min) / calcScaler(data));
      } else if (min < 0 && max <= 0) {
        return props.fromZero
          ? height * (val / calcScaler(data))
          : height * ((val - max) / calcScaler(data));
      }
    },
    [props.fromZero]
  );

  const getPropsForBackgroundLines = useCallback(() => {
    const { propsForBackgroundLines = {} } = props.chartConfig;
    return {
      stroke: props.chartConfig.color(0.2),
      strokeDasharray: "5, 10",
      strokeWidth: 1,
      ...propsForBackgroundLines
    };
  }, [props.chartConfig]);

  const getPropsForLabels = useCallback(() => {
    const {
      propsForLabels = {},
      color,
      labelColor = color
    } = props.chartConfig;

    return {
      fontSize: 12,
      fill: labelColor(0.8),
      ...propsForLabels
    };
  }, [props.chartConfig, props.highlightColor]);

  const getPropsForVerticalLabels = useCallback(
    (highlight: boolean = false) => {
      const {
        propsForVerticalLabels = {},
        color,
        labelColor = color
      } = props.chartConfig;
      return {
        fill:
          highlight && props.highlightColor
            ? props.highlightColor
            : labelColor(0.8),
        ...propsForVerticalLabels
      };
    },
    [props.chartConfig]
  );

  const getPropsForHorizontalLabels = useCallback(() => {
    const {
      propsForHorizontalLabels = {},
      color,
      labelColor = color
    } = props.chartConfig;
    return {
      fill: labelColor(0.8),
      ...propsForHorizontalLabels
    };
  }, [props.chartConfig]);

  const renderDefs = useCallback(
    (
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
        : props.chartConfig.color(1.0);

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
        : props.chartConfig.color(1.0);

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
    },
    [props.chartConfig]
  );

  return {
    calcScaler,
    calcBaseHeight,
    calcHeight,
    getPropsForBackgroundLines,
    getPropsForLabels,
    getPropsForVerticalLabels,
    getPropsForHorizontalLabels,
    renderDefs
  };
};

export const useBaseChart = (props: AbstractChartProps & any) => {
  const abstractChart = useAbstractChart(props);

  const renderHorizontalLines = useCallback(
    (config: any) => {
      const {
        count,
        width,
        height,
        paddingTop,
        verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT
      } = config;

      const basePosition = height - verticalLabelsHeight;

      return [...new Array(count + 1)].map((_, i) => {
        const paddingRight = 0;
        const y = (basePosition / count) * i + paddingTop;
        return (
          <Line
            key={Math.random()}
            x1={paddingRight}
            y1={y}
            x2={width}
            y2={y}
            {...abstractChart.getPropsForBackgroundLines()}
          />
        );
      });
    },
    [abstractChart.getPropsForBackgroundLines]
  );

  const renderHorizontalLine = useCallback(
    (config: any) => {
      const {
        width,
        height,
        paddingTop,
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
          {...abstractChart.getPropsForBackgroundLines()}
        />
      );
    },
    [abstractChart.getPropsForBackgroundLines]
  );

  const renderHorizontalLabels = useCallback(
    (config: Omit<AbstractChartConfig, "data"> & { data: number[] }) => {
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

      const { yAxisLabel = "", yAxisSuffix = "", yLabelsOffset = 12 } = props;
      return new Array(count === 1 ? 1 : count + 1).fill(1).map((_, i) => {
        let yLabel = String(i * count);

        if (count === 1) {
          yLabel = `${yAxisLabel}${formatYLabel(
            data[0].toFixed(decimalPlaces)
          )}${yAxisSuffix}`;
        } else {
          const label = props.fromZero
            ? (abstractChart.calcScaler(data) / count) * i +
              Math.min(...data, 0)
            : (abstractChart.calcScaler(data) / count) * i + Math.min(...data);
          yLabel = `${yAxisLabel}${formatYLabel(
            label.toFixed(decimalPlaces)
          )}${yAxisSuffix}`;
        }

        const basePosition = height - verticalLabelsHeight;
        const x = yLabelsOffset;
        const y =
          count === 1 && props.fromZero
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
            {...abstractChart.getPropsForLabels()}
            {...abstractChart.getPropsForHorizontalLabels()}
          >
            {yLabel}
          </Text>
        );
      });
    },
    [
      props.yAxisLabel,
      props.yAxisSuffix,
      props.yLabelsOffset,
      props.fromZero,
      abstractChart.calcScaler,
      abstractChart.getPropsForLabels,
      abstractChart.getPropsForHorizontalLabels
    ]
  );

  const renderVerticalLabels = useCallback(
    ({
      labels = [],
      highlightIndex,
      width,
      height,
      paddingRight,
      paddingTop,
      horizontalOffset = 0,
      stackedBar = false,
      verticalLabelRotation = 0,
      formatXLabel = xLabel => xLabel,
      verticalLabelsHeight = DEFAULT_X_LABELS_HEIGHT,
      onPress = ({ index }: { index: number }) => {}
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
      | "verticalLabelsHeight"
      | "onPress"
    > & { highlightIndex?: number }) => {
      const {
        xAxisLabel = "",
        xLabelsOffset = 0,
        hidePointsAtIndex = []
      } = props;
      width = width - paddingRight;

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
          paddingRight + ((width / labels.length) * i + horizontalOffset) * fac;

        const y = graphBottom + (fontSize * 3) / 2 + xLabelsOffset;

        const BaseTextElement = ({
          x,
          y,
          label,
          suffix = ""
        }: {
          x: number;
          y: number;
          label: string;
          suffix?: string;
        }) => (
          <G key={Math.random()}>
            <Rect
              x={x - 10}
              width={20}
              y={y - 20}
              height={20}
              onPress={() => onPress({ index: i })}
            />
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
              {...abstractChart.getPropsForLabels()}
              {...abstractChart.getPropsForVerticalLabels(
                highlightIndex !== null && i === highlightIndex
              )}
            >
              {`${formatXLabel(label)}${suffix}`}
            </Text>
          </G>
        );

        const mapLabel: string[] = Array.isArray(label) ? label : [label];

        return mapLabel.map((l: string, idx: number) => (
          <BaseTextElement
            key={idx}
            x={x}
            y={y + idx * 12}
            label={l}
            suffix={idx === mapLabel.length - 1 ? xAxisLabel : ""}
          />
        ));
      });
    },
    [
      props.xAxisLabel,
      props.xLabelsOffset,
      props.hidePointsAtIndex,
      abstractChart.getPropsForLabels,
      abstractChart.getPropsForVerticalLabels
    ]
  );

  const renderVerticalLines = useCallback(
    ({
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
      const { yAxisInterval = 1 } = props;

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
              {...abstractChart.getPropsForBackgroundLines()}
            />
          );
        }
      );
    },
    [props.yAxisInterval, abstractChart.getPropsForBackgroundLines]
  );

  const renderVerticalLine = useCallback(
    ({
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
        {...abstractChart.getPropsForBackgroundLines()}
      />
    ),
    [abstractChart.getPropsForBackgroundLines]
  );

  return {
    ...abstractChart,
    renderHorizontalLines,
    renderHorizontalLine,
    renderHorizontalLabels,
    renderVerticalLabels,
    renderVerticalLines,
    renderVerticalLine
  };
};

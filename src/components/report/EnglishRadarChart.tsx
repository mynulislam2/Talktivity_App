import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

const METRICS = ['Discourse', 'Fluency', 'Grammar', 'Vocabulary', 'Overall'];
const RADAR_SIZE = 160;
const RADIUS = RADAR_SIZE / 2;
const CENTER = RADAR_SIZE / 2;
const DIVISIONS = 4;

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function polygonPoints(
  values: number[],
  maxVal: number,
  count: number
): string {
  const step = 360 / count;
  const startAngle = -90;
  return values
    .map((v, i) => {
      const r = (Math.max(0, Math.min(maxVal, v)) / maxVal) * RADIUS;
      const pt = polarToCartesian(CENTER, CENTER, r, startAngle + step * i);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
}

function gridPoints(scale: number, count: number): string {
  const step = 360 / count;
  const startAngle = -90;
  const r = scale * RADIUS;
  return Array.from({ length: count }, (_, i) => {
    const pt = polarToCartesian(CENTER, CENTER, r, startAngle + step * i);
    return `${pt.x},${pt.y}`;
  }).join(' ');
}

function labelPosition(
  index: number,
  count: number,
  radius: number
): { x: number; y: number } {
  const step = 360 / count;
  const startAngle = -90;
  const labelRadius = radius + 22;
  return polarToCartesian(CENTER, CENTER, labelRadius, startAngle + step * index);
}

export interface EnglishRadarChartProps {
  values: [number, number, number, number, number];
}

export function EnglishRadarChart({ values }: EnglishRadarChartProps) {
  const count = METRICS.length;
  const step = 360 / count;
  const startAngle = -90;

  const gridScales = [0.25, 0.5, 0.75, 1];
  const outerPoints = gridPoints(1, count);
  const dataPoints = polygonPoints(values, 100, count);

  return (
    <View style={styles.container}>
      <Svg width="100%" height={250} viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE + 40}`}>
        {/* Grid lines from center to vertices */}
        {METRICS.map((_, i) => {
          const end = polarToCartesian(
            CENTER,
            CENTER,
            RADIUS,
            startAngle + step * i
          );
          return (
            <Line
              key={`gridline-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(128,128,128,0.3)"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Grid polygons */}
        {gridScales.map((scale) => (
          <Polygon
            key={`grid-${scale}`}
            points={gridPoints(scale, count)}
            fill="none"
            stroke="rgba(128,128,128,0.3)"
            strokeWidth={0.5}
          />
        ))}

        {/* Outer polygon border */}
        <Polygon
          points={outerPoints}
          fill="none"
          stroke="rgba(128,128,128,0.5)"
          strokeWidth={1}
        />

        {/* Data polygon */}
        <Polygon
          points={dataPoints}
          fill="none"
          stroke="rgba(157,157,157,1)"
          strokeWidth={2}
        />

        {/* Data points */}
        {values.map((v, i) => {
          const r = (Math.max(0, Math.min(100, v)) / 100) * RADIUS;
          const pt = polarToCartesian(
            CENTER,
            CENTER,
            r,
            startAngle + step * i
          );
          return (
            <Circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={3}
              fill="rgba(157,157,157,1)"
            />
          );
        })}

        {/* Labels */}
        {METRICS.map((label, i) => {
          const pos = labelPosition(i, count, RADIUS);
          return (
            <SvgText
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              fill="rgba(255,255,255,0.55)"
              fontSize={11}
              fontWeight="500"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 323,
  },
});

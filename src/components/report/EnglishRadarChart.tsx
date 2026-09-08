/**
 * EnglishRadarChart Component (React Native)
 *
 * 5-metric pentagon radar chart with responsive viewBox, non-clipping labels,
 * concentric division polygons, and translucent blue data fill.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';

const VIEWBOX_MIN_X = -30;
const VIEWBOX_WIDTH = 400;
const SVG_HEIGHT = 240;
const CX = 170;
const CY = 120;
const RADIUS = 66;
const LABEL_RADIUS = 88;
const DIVISIONS = [0.25, 0.5, 0.75, 1];

const DEFAULT_METRICS = ['Overall', 'Fluency', 'Lexical', 'Grammar', 'Pronunciation'];

function getAngleDeg(index: number, count: number): number {
  return (360 / count) * index;
}

function getCoordinates(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.sin(rad),
    y: cy - r * Math.cos(rad),
  };
}

function getTextAnchor(angleDeg: number): 'start' | 'end' | 'middle' {
  if (angleDeg === 0 || Math.abs(angleDeg - 360) < 1e-3 || Math.abs(angleDeg - 180) < 1e-3) {
    return 'middle';
  }
  return angleDeg < 180 ? 'start' : 'end';
}

function getDy(angleDeg: number): number {
  if (angleDeg === 0 || Math.abs(angleDeg - 360) < 1e-3) return -8;
  if (angleDeg > 120 && angleDeg < 240) return 14;
  return 4;
}

export interface EnglishRadarChartProps {
  /** [Pronunciation, Fluency, Lexical, Grammar, Overall] */
  values: [number, number, number, number, number];
  metrics?: string[];
}

export function EnglishRadarChart({
  values,
  metrics = DEFAULT_METRICS,
}: EnglishRadarChartProps) {
  const count = metrics.length;

  // Grid polygons for each division
  const gridPolygons = DIVISIONS.map((scale) => {
    return Array.from({ length: count }, (_, i) => {
      const pt = getCoordinates(CX, CY, scale * RADIUS, getAngleDeg(i, count));
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    }).join(' ');
  });

  // Data polygon points
  const dataPoints = Array.from({ length: count }, (_, i) => {
    const rawVal = values[i] ?? 50;
    const clamped = Math.max(10, Math.min(100, rawVal));
    const r = (clamped / 100) * RADIUS;
    return getCoordinates(CX, CY, r, getAngleDeg(i, count));
  });

  const dataPolygonString = dataPoints
    .map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`)
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width="100%" height={SVG_HEIGHT} viewBox={`${VIEWBOX_MIN_X} 0 ${VIEWBOX_WIDTH} ${SVG_HEIGHT}`}>
        {/* Radial spoke lines from center to outer vertices */}
        {Array.from({ length: count }, (_, i) => {
          const pt = getCoordinates(CX, CY, RADIUS, getAngleDeg(i, count));
          return (
            <Line
              key={`spoke-${i}`}
              x1={CX}
              y1={CY}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* Concentric grid polygons */}
        {gridPolygons.map((points, idx) => (
          <Polygon
            key={`grid-${idx}`}
            points={points}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
          />
        ))}

        {/* Filled Data Polygon */}
        <Polygon
          points={dataPolygonString}
          fill="rgba(59,130,246,0.22)"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points (dots on vertices) */}
        {dataPoints.map((pt, i) => (
          <Circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={3.5}
            fill="#60a5fa"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        ))}

        {/* Metric Labels */}
        {metrics.map((label, i) => {
          const angle = getAngleDeg(i, count);
          const pos = getCoordinates(CX, CY, LABEL_RADIUS, angle);
          const anchor = getTextAnchor(angle);
          const dy = getDy(angle);

          return (
            <SvgText
              key={`label-${i}`}
              x={pos.x}
              y={pos.y + dy}
              fill="#e2e8f0"
              fontSize={12}
              fontWeight="500"
              textAnchor={anchor}
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
    justifyContent: 'center',
    width: '100%',
  },
});

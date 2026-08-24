/**
 * CEFRProgressCard Component (React Native)
 *
 * CEFR proficiency level progress card with level bar — matches frontend.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import type { ProficiencyResult } from '@/types/proficiency';

interface CEFRProgressCardProps {
  proficiency: ProficiencyResult | null;
  startingLevel?: string | null;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const RADAR_CENTER = { x: 162, y: 116 };
const RADAR_RADIUS = 58;
const GRID_SCALES = [1, 0.75, 0.5, 0.25];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number
) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
}

function polygonPoints(scores: number[], radius = RADAR_RADIUS) {
  return scores
    .map((score, i) => {
      const angle = -90 + (360 / scores.length) * i;
      const p = polarToCartesian(
        RADAR_CENTER.x,
        RADAR_CENTER.y,
        (radius * Math.max(0, Math.min(100, score))) / 100,
        angle
      );
      return `${p.x},${p.y}`;
    })
    .join(' ');
}

function scalePolygon(scale: number, count = 5) {
  return Array.from({ length: count }, (_, i) => {
    const angle = -90 + (360 / count) * i;
    const p = polarToCartesian(
      RADAR_CENTER.x,
      RADAR_CENTER.y,
      RADAR_RADIUS * scale,
      angle
    );
    return `${p.x},${p.y}`;
  }).join(' ');
}

const CONFIDENCE_NOTES: Record<string, string> = {
  none: 'Finish a few sessions to unlock your CEFR assessment.',
  preliminary:
    "Keep it up! You've unlocked some scores. A few more sessions will make them more reliable.",
  developing:
    "Keep it up! You've unlocked some scores. Keep learning to unlock the rest.",
  established:
    "Keep it up! You've unlocked some scores. Keep learning to unlock the rest.",
};

function SkillRadarChart({ proficiency }: { proficiency: ProficiencyResult }) {
  const radarAxes = [
    {
      key: 'overall',
      score: proficiency.overallScore,
      label: 'Overall',
      left: '50%',
      top: 0,
      textAlign: 'center' as const,
    },
    {
      key: 'vocabulary',
      score: proficiency.skills.vocabulary.score,
      label: 'Vocabulary',
      left: 'auto',
      right: 0,
      top: 76,
      textAlign: 'left' as const,
    },
    {
      key: 'grammar',
      score: proficiency.skills.grammar.score,
      label: 'Grammar',
      left: 'auto',
      right: 17,
      top: 147,
      textAlign: 'left' as const,
    },
    {
      key: 'fluency',
      score: proficiency.skills.fluency.score,
      label: 'Fluency',
      left: 14,
      top: 147,
      textAlign: 'right' as const,
    },
    {
      key: 'discourse',
      score: proficiency.skills.discourse.score,
      label: 'Discourse',
      left: 0,
      top: 76,
      textAlign: 'right' as const,
    },
  ];

  const dataScores = radarAxes.map((a) => a.score);
  const gridPolygons = GRID_SCALES.map((s) =>
    scalePolygon(s, radarAxes.length)
  );
  const outerPolygon = scalePolygon(1, radarAxes.length);
  const dataPolygon = polygonPoints(dataScores, RADAR_RADIUS);

  const outerAxisPoints = radarAxes.map((_, i) =>
    polarToCartesian(
      RADAR_CENTER.x,
      RADAR_CENTER.y,
      RADAR_RADIUS,
      -90 + (360 / radarAxes.length) * i
    )
  );
  const dataAxisPoints = radarAxes.map((axis, i) =>
    polarToCartesian(
      RADAR_CENTER.x,
      RADAR_CENTER.y,
      (RADAR_RADIUS * Math.max(0, Math.min(100, axis.score))) / 100,
      -90 + (360 / radarAxes.length) * i
    )
  );

  return (
    <View style={styles.radarContainer}>
      <Svg viewBox="0 0 323 189" width="100%" height={189}>
        {/* Filled outer polygon */}
        <Polygon points={outerPolygon} fill="rgba(41,73,255,0.16)" />
        {/* Axis lines */}
        {outerAxisPoints.map((pt, i) => (
          <Line
            key={`axis-${i}`}
            x1={RADAR_CENTER.x}
            y1={RADAR_CENTER.y}
            x2={pt.x}
            y2={pt.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}
        {/* Grid polygons */}
        {gridPolygons.map((poly, i) => (
          <Polygon
            key={`grid-${i}`}
            points={poly}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={i === 0 ? 1.1 : 1}
          />
        ))}
        {/* Data polygon */}
        <Polygon
          points={dataPolygon}
          fill="rgba(255,255,255,0.03)"
          stroke="rgba(255,255,255,0.78)"
          strokeWidth="1.45"
        />
        {/* Data points */}
        {dataAxisPoints.map((pt, i) => (
          <React.Fragment key={`pt-${i}`}>
            <Circle cx={pt.x} cy={pt.y} r="4.3" fill="rgba(40,121,255,0.18)" />
            <Circle cx={pt.x} cy={pt.y} r="3.2" fill="#2879ff" />
            <Circle cx={pt.x} cy={pt.y} r="1.4" fill="#fdfdfd" />
          </React.Fragment>
        ))}
      </Svg>

      {/* Axis labels */}
      {radarAxes.map((axis) => (
        <View
          key={axis.key}
          style={[
            styles.radarLabel,
            {
              left: (axis as any).left,
              right: (axis as any).right,
              top: axis.top,
            },
          ]}
        >
          <Text style={styles.radarScore}>{axis.score}%</Text>
          <Text style={styles.radarLabelText}>{axis.label}</Text>
        </View>
      ))}
    </View>
  );
}

function formatStartingLevel(level?: string | null) {
  switch (level) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'upper':
      return 'Upper-Intermediate';
    case 'advanced':
      return 'Advanced';
    default:
      return level || null;
  }
}

function getLevelFillPercentage(level: string) {
  const index = CEFR_LEVELS.indexOf(level);
  if (index < 0) return 0;
  return ((index + 1) / CEFR_LEVELS.length) * 100;
}

function getCefrCategory(level: string) {
  if (level === 'A1' || level === 'A2') return 'Basic';
  if (level === 'B1' || level === 'B2') return 'Independent';
  return 'Proficient';
}

export function CEFRProgressCard({
  proficiency,
  startingLevel,
}: CEFRProgressCardProps) {
  const navigation = useNavigation<any>();
  const formattedStartingLevel = formatStartingLevel(startingLevel);

  if (
    !proficiency ||
    proficiency.confidence === 'none' ||
    proficiency.overallLevel === 'Not yet assessed'
  ) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Your Proficiency</Text>
        <Text style={styles.description}>{CONFIDENCE_NOTES.none}</Text>
        {formattedStartingLevel && (
          <Text style={styles.startedAt}>
            Started at:{' '}
            <Text style={styles.startedAtValue}>{formattedStartingLevel}</Text>{' '}
            <Text style={styles.selfReported}>(self-reported)</Text>
          </Text>
        )}
        <FigmaPrimaryButton
          onPress={() =>
            navigation.navigate('LearningStack', { screen: 'TopicsScreen' })
          }
          style={{ width: '100%', marginTop: 16 }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
            Go to Lessons
          </Text>
        </FigmaPrimaryButton>
      </View>
    );
  }

  const fillPercentage = getLevelFillPercentage(proficiency.overallLevel);
  const descriptor = getCefrCategory(proficiency.overallLevel);
  const currentLevelIndex = Math.max(
    0,
    CEFR_LEVELS.indexOf(proficiency.overallLevel)
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Proficiency</Text>
        <Text style={styles.description}>
          {CONFIDENCE_NOTES[proficiency.confidence]}
        </Text>
        {formattedStartingLevel && (
          <Text style={styles.startedAt}>
            Started at:{' '}
            <Text style={styles.startedAtValue}>{formattedStartingLevel}</Text>{' '}
            <Text style={styles.selfReported}>(self-reported)</Text>
          </Text>
        )}
      </View>

      {/* Level Bar */}
      <View style={styles.levelBar}>
        <View style={styles.levelBarTrack}>
          {fillPercentage > 0 && (
            <LinearGradient
              colors={['#0e55ff', '#c55dfe']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.levelBarFill, { width: `${fillPercentage}%` }]}
            />
          )}
          <View style={styles.levelBarLabels}>
            {CEFR_LEVELS.map((level, index) => (
              <View key={level} style={styles.levelLabelItem}>
                <Text
                  style={[
                    styles.levelLabelText,
                    index <= currentLevelIndex && styles.levelLabelTextActive,
                  ]}
                >
                  {level}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.levelDescriptor}>
          {descriptor}{' '}
          <Text style={styles.levelHighlight}>{proficiency.overallLevel}</Text>
        </Text>
      </View>

      {/* Radar Chart — matching frontend */}
      <SkillRadarChart proficiency={proficiency} />

      <FigmaPrimaryButton
        onPress={() =>
          navigation.navigate('LearningStack', { screen: 'TopicsScreen' })
        }
        style={{ width: '100%', marginTop: 16 }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', fontFamily: 'Poppins-Medium' }}>
          Go to Lessons
        </Text>
      </FigmaPrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#3d3e50',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8c8c8c',
  },
  startedAt: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.6)',
  },
  startedAtValue: {
    color: 'rgba(255,255,255,0.85)',
  },
  selfReported: {
    color: 'rgba(255,255,255,0.5)',
  },
  levelBar: {
    gap: 8,
  },
  levelBarTrack: {
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7c5afe',
    backgroundColor: 'rgba(14,85,255,0.24)',
    overflow: 'hidden',
    position: 'relative',
  },
  levelBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  levelBarLabels: {
    flexDirection: 'row',
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  levelLabelItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelLabelText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '400', fontFamily: 'Poppins',
  },
  levelLabelTextActive: {
    color: '#fff',
  },
  levelDescriptor: {
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
  },
  levelHighlight: {
    color: '#2879ff',
  },
  radarContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 323,
    height: 189,
    alignSelf: 'center',
  },
  radarLabel: {
    position: 'absolute',
    width: 98,
  },
  radarScore: {
    fontSize: 18,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: '#2879ff',
  },
  radarLabelText: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    color: '#8c8c8c',
  },
});

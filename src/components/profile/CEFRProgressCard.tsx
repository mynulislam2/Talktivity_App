/**
 * IELTSProgressCard / CEFRProgressCard Component (React Native)
 *
 * IELTS Speaking Proficiency card with milestone band bar and IELTS criteria radar.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Circle, Line } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import {
  IELTS_MILESTONES,
  getIeltsDescriptor,
  getIeltsBarFillPercentage,
  startingLevelToIeltsBand,
} from '@/lib/report/cefrProficiency';
import { formatBandLabel } from '@/lib/report/bandLabel';
import type { ProficiencyResult } from '@/types/proficiency';

interface CEFRProgressCardProps {
  proficiency: ProficiencyResult | null;
  startingLevel?: string | null;
}
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
  none: 'Complete a few sessions to assess your band.',
  preliminary: 'Complete a few more sessions to refine your band.',
  developing: 'Keep practicing to improve your band.',
  established: 'Keep speaking daily to reach your target band.',
};

/** "6.5 (B2)" — the radar labels are too narrow for the full "Band X (CEFR)"
 * text, but must still show the CEFR (I6), so this reuses formatBandLabel and
 * drops just the "Band " prefix. */
function compactBandLabel(bandStr?: string | null): string {
  const num = Number(bandStr);
  const label = bandStr && Number.isFinite(num) ? formatBandLabel(num) : null;
  return label ? label.replace(/^Band /, '') : '—';
}

function SkillRadarChart({ proficiency }: { proficiency: ProficiencyResult }) {
  const overallBand = compactBandLabel(proficiency.ieltsBand);
  const vocabBand = compactBandLabel(proficiency.skills.vocabulary.ieltsBand);
  const grammarBand = compactBandLabel(proficiency.skills.grammar.ieltsBand);
  const fluencyBand = compactBandLabel(proficiency.skills.fluency.ieltsBand);
  const pronunciationBand = compactBandLabel(proficiency.skills.pronunciation?.ieltsBand);

  const radarAxes = [
    {
      key: 'overall',
      score: proficiency.overallScore,
      band: overallBand,
      label: 'Overall Band',
      left: '50%',
      marginLeft: -55,
      width: 110,
      top: 0,
      textAlign: 'center' as const,
      alignItems: 'center' as const,
    },
    {
      key: 'vocabulary',
      score: proficiency.skills.vocabulary.score,
      band: vocabBand,
      label: 'Lexical Resource',
      left: 250,
      width: 75,
      top: 76,
      textAlign: 'left' as const,
      alignItems: 'flex-start' as const,
    },
    {
      key: 'grammar',
      score: proficiency.skills.grammar.score,
      band: grammarBand,
      label: 'Grammar',
      left: 244,
      width: 75,
      top: 147,
      textAlign: 'left' as const,
      alignItems: 'flex-start' as const,
    },
    {
      key: 'fluency',
      score: proficiency.skills.fluency.score,
      band: fluencyBand,
      label: 'Fluency',
      left: 22,
      width: 85,
      top: 147,
      textAlign: 'left' as const,
      alignItems: 'flex-start' as const,
    },
    {
      key: 'pronunciation',
      // Never falls back to another skill's score — a not-yet-measured
      // pronunciation renders as an empty (0) axis, not someone else's value.
      score: proficiency.skills.pronunciation?.score ?? 0,
      band: pronunciationBand,
      label: 'Pronunciation',
      left: 12,
      width: 85,
      top: 76,
      textAlign: 'left' as const,
      alignItems: 'flex-start' as const,
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
              width: axis.width,
              marginLeft: (axis as any).marginLeft,
              alignItems: axis.alignItems,
            },
          ]}
        >
          <Text style={[styles.radarScore, { textAlign: axis.textAlign }]}>
            {axis.band}
          </Text>
          <Text style={[styles.radarLabelText, { textAlign: axis.textAlign }]}>
            {axis.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** "Band 2.0 (A1, approx.)" — the same "Band X (CEFR)" format used everywhere
 * else (owner rule), derived from the self-rated band itself rather than the
 * onboarding descriptor. */
function formatStartingLevel(level?: string | null) {
  const band = startingLevelToIeltsBand(level);
  if (band) {
    return formatBandLabel(Number(band));
  }
  return level || null;
}

export function CEFRProgressCard({
  proficiency,
  startingLevel,
}: CEFRProgressCardProps) {
  const navigation = useNavigation<any>();
  const formattedStartingLevel = formatStartingLevel(startingLevel);

  // A target band can be set before any assessment exists, so this is
  // computed once and shown in both the empty and the assessed states.
  const targetBandNumeric =
    proficiency?.targetBand != null ? Number(proficiency.targetBand) : null;
  const targetBandLabel =
    targetBandNumeric != null && Number.isFinite(targetBandNumeric)
      ? formatBandLabel(targetBandNumeric)
      : null;
  const bandGapNumeric = proficiency?.bandGap != null ? Number(proficiency.bandGap) : null;
  const targetLine =
    targetBandLabel != null ? (
      <Text style={styles.startedAt}>
        Target: <Text style={styles.startedAtValue}>{targetBandLabel}</Text>
        {bandGapNumeric != null && Number.isFinite(bandGapNumeric) && bandGapNumeric > 0
          ? ` (${bandGapNumeric.toFixed(1)} band to go)`
          : ''}
      </Text>
    ) : null;

  if (
    !proficiency ||
    proficiency.confidence === 'none' ||
    proficiency.overallLevel === 'Not yet assessed'
  ) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>IELTS Speaking Proficiency</Text>
        <Text style={styles.description}>{CONFIDENCE_NOTES.none}</Text>
        {formattedStartingLevel && (
          <Text style={styles.startedAt}>
            Self-rated start: <Text style={styles.startedAtValue}>{formattedStartingLevel}</Text>
          </Text>
        )}
        {targetLine}
        <FigmaPrimaryButton
          onPress={() =>
            navigation.navigate('LearningStack', { screen: 'TopicsScreen' })
          }
          style={{ width: '100%', marginTop: 16 }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 14,
              fontWeight: '500',
              fontFamily: 'Poppins-Medium',
            }}
          >
            Practice IELTS Speaking
          </Text>
        </FigmaPrimaryButton>
      </View>
    );
  }

  const currentBand = String(proficiency.ieltsBand || '1.0');
  const fillPercentage = getIeltsBarFillPercentage(currentBand);
  const descriptor =
    proficiency.ieltsDescriptor || getIeltsDescriptor(currentBand);
  const currentBandNumeric = parseFloat(currentBand);
  const currentBandLabel =
    formatBandLabel(currentBandNumeric, proficiency.overallLevel) ?? `Band ${currentBand}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>IELTS Speaking Proficiency</Text>
        <Text style={styles.description}>
          {CONFIDENCE_NOTES[proficiency.confidence]}
        </Text>
        {formattedStartingLevel && (
          <Text style={styles.startedAt}>
            Self-rated start: <Text style={styles.startedAtValue}>{formattedStartingLevel}</Text>
          </Text>
        )}
        {targetLine}
      </View>

      {/* IELTS Milestone Level Bar */}
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
            {IELTS_MILESTONES.map((milestone) => {
              const milestoneNumeric = parseFloat(milestone);
              const isActive = currentBandNumeric >= milestoneNumeric;
              return (
                <View key={milestone} style={styles.levelLabelItem}>
                  <Text
                    style={[
                      styles.levelLabelText,
                      isActive && styles.levelLabelTextActive,
                    ]}
                  >
                    {milestone}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
        <Text style={styles.levelDescriptor}>
          {descriptor}{' '}
          <Text style={styles.levelHighlight}>{currentBandLabel}</Text>
        </Text>
      </View>

      {/* Radar Chart — matching official IELTS criteria */}
      <SkillRadarChart proficiency={proficiency} />

      <FigmaPrimaryButton
        onPress={() =>
          navigation.navigate('LearningStack', { screen: 'TopicsScreen' })
        }
        style={{ width: '100%', marginTop: 16 }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 14,
            fontWeight: '500',
            fontFamily: 'Poppins-Medium',
          }}
        >
          Practice IELTS Speaking
        </Text>
      </FigmaPrimaryButton>
    </View>
  );
}

// Export alias for callers using IELTS naming
export const IELTSProgressCard = CEFRProgressCard;

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
    fontSize: 22,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.12,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: '#8c8c8c',
  },
  startedAt: {
    fontSize: 13,
    fontFamily: 'Poppins',
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
    marginTop: 12,
    marginBottom: 4,
    gap: 14,
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
    fontWeight: '400',
    fontFamily: 'Poppins',
  },
  levelLabelTextActive: {
    color: '#fff',
  },
  levelDescriptor: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  levelHighlight: {
    color: '#2879ff',
  },
  radarContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 323,
    height: 195,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  radarLabel: {
    position: 'absolute',
  },
  radarScore: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#2879ff',
  },
  radarLabelText: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins',
    color: '#8c8c8c',
  },
});

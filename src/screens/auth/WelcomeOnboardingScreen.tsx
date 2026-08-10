/**
 * WelcomeOnboardingScreen
 *
 * 3 swipeable onboarding slides:
 *   Slide 1 – Speak with Confidence (coach avatar)
 *   Slide 2 – Interactive Review (coach bubble, mistake card, mic, feedback)
 *   Slide 3 – Track Your Progress (radar chart)
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Polygon, Circle, Line } from 'react-native-svg';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import GradientButton from '../../components/common/GradientButton';
import PaginationDots from '../../components/common/PaginationDots';
import type { AuthStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

// ─── Radar constants ──────────────────────────────────────────────────────
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const RADAR_CENTER = { x: 162, y: 150 };
const RADAR_RADIUS = 75;
const GRID_SCALES = [1, 0.75, 0.5, 0.25];
const SAMPLE_LEVEL = 'B2';

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

// ─── Slide Visuals ────────────────────────────────────────────────────────

/** Slide 1: Coach avatar */
const AvatarVisual = () => (
  <View style={s1.container}>
    <Image
      source={require('../../assets/images/coach-avatar.png')}
      style={s1.avatar}
      resizeMode="contain"
    />
  </View>
);

/** Slide 2: Interactive Review — preview cards from the review screen */
const ReviewVisual = () => {
  const sampleItems = [
    {
      original: 'He go to school yesterday',
      corrected: 'He went to school yesterday',
      type: 'Grammar',
    },
    {
      original: 'I have visited there in 2019',
      corrected: 'I visited there in 2019',
      type: 'Grammar',
    },
    {
      original: "She don't like coffee",
      corrected: "She doesn't like coffee",
      type: 'Grammar',
    },
  ];

  return (
    <View style={s2.container}>
      <View style={s2.previewList}>
        {sampleItems.map((item, index) => (
          <View key={index} style={s2.previewCard}>
            <View style={s2.previewNumber}>
              <Text style={s2.previewNumberText}>
                {String(index + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s2.previewRow}>
                <View style={[s2.iconSmall, { borderColor: '#ff2323' }]}>
                  <Text
                    style={{
                      color: '#ff2323',
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    ✕
                  </Text>
                </View>
                <Text style={s2.previewOriginal} numberOfLines={1}>
                  {item.original}
                </Text>
              </View>
              <View style={[s2.previewRow, { marginTop: 6 }]}>
                <View style={[s2.iconSmall, { borderColor: '#07e500' }]}>
                  <Text
                    style={{
                      color: '#07e500',
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    ✓
                  </Text>
                </View>
                <Text style={s2.previewCorrected} numberOfLines={1}>
                  {item.corrected}
                </Text>
              </View>
            </View>
            <View style={s2.previewBadge}>
              <Text style={s2.previewBadgeText}>{item.type}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

/** Slide 3: Radar chart */
const RadarVisual = () => {
  const LABEL_RADIUS = RADAR_RADIUS + 30;
  const axisLabels = [
    { key: 'fluency', score: 72, label: 'Fluency', angle: -90 },
    { key: 'vocabulary', score: 82, label: 'Vocabulary', angle: -18 },
    { key: 'accuracy', score: 68, label: 'Accuracy', angle: 54 },
    { key: 'discourse', score: 78, label: 'Discourse', angle: 126 },
    { key: 'pronunciation', score: 75, label: 'Pronunciation', angle: 198 },
  ];

  const radarAxes = axisLabels.map((a) => ({
    ...a,
    pos: polarToCartesian(
      RADAR_CENTER.x,
      RADAR_CENTER.y,
      LABEL_RADIUS,
      a.angle
    ),
    dataPos: polarToCartesian(
      RADAR_CENTER.x,
      RADAR_CENTER.y,
      (RADAR_RADIUS * Math.max(0, Math.min(100, a.score))) / 100,
      a.angle
    ),
  }));

  const dataScores = radarAxes.map((a) => a.score);
  const gridPolygons = GRID_SCALES.map((s) =>
    scalePolygon(s, radarAxes.length)
  );
  const outerPolygon = scalePolygon(1, radarAxes.length);
  const dataPolygon = polygonPoints(dataScores, RADAR_RADIUS);
  const outerAxisPoints = radarAxes.map((a) =>
    polarToCartesian(RADAR_CENTER.x, RADAR_CENTER.y, RADAR_RADIUS, a.angle)
  );
  const dataAxisPoints = radarAxes.map((a) => a.dataPos);

  return (
    <View style={s3.container}>
      <View style={s3.radarContainer}>
        <Svg viewBox="0 0 323 310" width="100%" height={310}>
          <Polygon points={outerPolygon} fill="rgba(41,73,255,0.16)" />
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
          {gridPolygons.map((poly, i) => (
            <Polygon
              key={`grid-${i}`}
              points={poly}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={i === 0 ? 1.1 : 1}
            />
          ))}
          <Polygon
            points={dataPolygon}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.78)"
            strokeWidth="1.45"
          />
          {dataAxisPoints.map((pt, i) => (
            <React.Fragment key={`pt-${i}`}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r="4.3"
                fill="rgba(40,121,255,0.18)"
              />
              <Circle cx={pt.x} cy={pt.y} r="3.2" fill="#2879ff" />
              <Circle cx={pt.x} cy={pt.y} r="1.4" fill="#fdfdfd" />
            </React.Fragment>
          ))}
        </Svg>
        {radarAxes.map((axis) => {
          const isLeft = axis.pos.x < RADAR_CENTER.x;
          let leftPos = axis.pos.x - 75;
          let topPos = axis.pos.y - 20;
          if (axis.key === 'pronunciation') {
            leftPos = axis.pos.x - 40;
            topPos = axis.pos.y - 12;
          }
          if (axis.key === 'discourse') {
            leftPos = axis.pos.x - 25;
            topPos = axis.pos.y - 5;
          }
          if (axis.key === 'fluency') {
            leftPos = axis.pos.x + 10;
            topPos = axis.pos.y - 45;
          }
          if (axis.key === 'vocabulary') {
            leftPos = axis.pos.x + 22;
            topPos = axis.pos.y - 30;
          }
          if (axis.key === 'accuracy') {
            leftPos = axis.pos.x + 35;
            topPos = axis.pos.y - 5;
          }
          return (
            <View
              key={axis.key}
              style={[s3.radarLabel, { left: leftPos, top: topPos }]}
            >
              <Text
                style={[
                  s3.radarScore,
                  { textAlign: isLeft ? 'right' : 'left' },
                ]}
              >
                {axis.score}%
              </Text>
              <Text
                style={[
                  s3.radarLabelText,
                  { textAlign: isLeft ? 'right' : 'left' },
                ]}
              >
                {axis.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Slides Data ──────────────────────────────────────────────────────────

interface SlideData {
  id: string;
  headline: string;
  description: string;
  visual: React.ReactNode;
}

const slides: SlideData[] = [
  {
    id: '1',
    headline: 'Speak with Confidence',
    description:
      'Practice real conversations, get instant feedback, and improve your speaking step by step.',
    visual: <AvatarVisual />,
  },
  {
    id: '2',
    headline: 'Interactive Review',
    description:
      'Review your practice sessions with detailed feedback on your speaking performance.',
    visual: <ReviewVisual />,
  },
  {
    id: '3',
    headline: 'Track Your Progress',
    description:
      'Monitor your improvement across CEFR levels and key language skills over time.',
    visual: <RadarVisual />,
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'WelcomeOnboarding'
>;

const WelcomeOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderItem = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      {item.visual}
      <Text style={styles.headline}>{item.headline}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.dark.background}
      />
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />
      <View style={styles.bottomSection}>
        <PaginationDots totalDots={slides.length} activeIndex={currentIndex} />
        <GradientButton
          label={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="large"
          fullWidth
          style={styles.primaryButton}
          gradientColors={['#0e55ff', '#6a4bff', '#c55dfe'] as const}
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.background },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: { fontSize: 14, color: '#8C8C8C', fontWeight: '400' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing['2xl'],
    paddingTop: 40,
  },
  headline: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fdfdfd',
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 33.6,
    letterSpacing: 0.14,
    marginTop: 24,
  },
  description: {
    fontSize: 15,
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  bottomSection: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  primaryButton: { marginBottom: spacing.sm },
});

const s1 = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 260, height: 300 },
});

const s2 = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 80,
  },
  previewList: { width: width - 60, maxWidth: 340, gap: 10 },
  previewCard: {
    position: 'relative',
    flexDirection: 'row',
    gap: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
    padding: 12,
  },
  previewNumber: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#636370',
    backgroundColor: '#484960',
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  previewNumberText: { fontSize: 12, lineHeight: 17, color: '#fff' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconSmall: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOriginal: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#ffacac',
    textDecorationLine: 'line-through',
  },
  previewCorrected: { flex: 1, fontSize: 11, lineHeight: 16, color: '#fdfdfd' },
  previewBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#636370',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewBadgeText: { fontSize: 8, lineHeight: 11, color: '#fdfdfd' },
});

const s3 = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  radarContainer: {
    position: 'relative',
    width: width - 20,
    maxWidth: 460,
    height: 310,
    alignSelf: 'center',
  },
  radarLabel: { position: 'absolute', width: 65 },
  radarScore: { fontSize: 18, fontWeight: '500', color: '#2879ff' },
  radarLabelText: { fontSize: 12, fontWeight: '400', color: '#8c8c8c' },
});

export default WelcomeOnboardingScreen;

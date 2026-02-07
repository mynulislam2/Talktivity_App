/**
 * Report Screen
 * 
 * Post-session feedback and analysis
 * Shows 5-card carousel with scores and recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadLastReport, selectLastReport, selectReportLoading, selectReportError } from '../../store/slices/reportSlice';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import OverallScoreCard from '../../components/report/OverallScoreCard';
import FluencyCard from '../../components/report/FluencyCard';
import GrammarCard from '../../components/report/GrammarCard';
import VocabularyCard from '../../components/report/VocabularyCard';
import DiscourseCard from '../../components/report/DiscourseCard';

interface ReportData {
  sessionId: string;
  sessionType: 'practice' | 'call' | 'roleplay';
  timestamp: string;
  duration: number; // in seconds
  wordCount: number;
  overallScore: number;
  fluency: {
    score: number;
    wpm: number;
    clarity: number;
    pace: string;
  };
  grammar: {
    score: number;
    totalErrors: number;
    commonErrors: string[];
    suggestions: string[];
  };
  vocabulary: {
    score: number;
    totalWords: number;
    uniqueWords: number;
    newWords: string[];
    vocabulary_level: string;
  };
  discourse: {
    score: number;
    coherence: number;
    organization: number;
    feedback: string[];
  };
}

interface ReportScreenProps {
  navigation: any;
  route: any;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - spacing.lg * 2;

const ReportScreen: React.FC<ReportScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const reportData = route.params?.reportData as ReportData;
  const sessionType = route.params?.sessionType || 'practice';
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Redux selectors for fallback
  const lastReport = useAppSelector(selectLastReport);
  const reduxLoading = useAppSelector(selectReportLoading);
  const reduxError = useAppSelector(selectReportError);

  // Load last report as fallback if no route params
  useEffect(() => {
    if (!reportData) {
      dispatch(loadLastReport());
    }
  }, [dispatch, reportData]);

  // Show error alert
  useEffect(() => {
    if (reduxError && !reportData) {
      Alert.alert('Error', reduxError);
    }
  }, [reduxError, reportData]);

  // Use route params or Redux fallback
  const displayData = reportData || lastReport;
  const isLoading = loading || (reduxLoading && !reportData);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!displayData) {

  const cards = [
    {
      id: 'overall',
      component: <OverallScoreCard data={displayData} />,
      label: 'Overall Score',
    },
    {
      id: 'fluency',
      component: <FluencyCard data={displayData.fluency} />,
      label: 'Fluency',
    },
    {
      id: 'grammar',
      component: <GrammarCard data={displayData.grammar} />,
      label: 'Grammar',
    },
    {
      id: 'vocabulary',
      component: <VocabularyCard data={displayData.vocabulary} />,
      label: 'Vocabulary',
    },
    {
      id: 'discourse',
      component: <DiscourseCard data={displayData.discourse} />,
      label: 'Discourse',
    },
  ];

  const handleSaveReport = async () => {
    setLoading(true);
    try {
      // In a real app, save report to backend
      Alert.alert('Success', 'Report saved successfully!');
      // Navigate to home after saving
      navigation.navigate('TopicsScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeAgain = async () => {
    // Navigate back to learning with option to continue
    navigation.navigate('TopicsScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Session Report</Text>
          <Text style={styles.sessionType}>
            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session
          </Text>
        </View>
        <Text style={styles.sessionDate}>
          {new Date(reportData.timestamp).toLocaleDateString()}
        </Text>
      </View>

      {/* Cards Navigation Indicator */}
      <View style={styles.indicatorContainer}>
        {cards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentCardIndex ? colors.primary : '#E0E0E0',
                width: index === currentCardIndex ? 30 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Cards Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const cardIndex = Math.round(contentOffsetX / CARD_WIDTH);
          setCurrentCardIndex(Math.min(cardIndex, cards.length - 1));
        }}
        scrollEventThrottle={16}
        style={styles.cardsContainer}
      >
        {cards.map((card) => (
          <View
            key={card.id}
            style={[styles.cardWrapper, { width: CARD_WIDTH }]}
          >
            {card.component}
          </View>
        ))}
      </ScrollView>

      {/* Card Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.cardLabel}>{cards[currentCardIndex].label}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handlePracticeAgain}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.secondaryButtonText}>Practice Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSaveReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Finish</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Session Summary Footer */}
      <View style={styles.summaryFooter}>
        <View style={styles.summaryItem}>
          <Ionicons name="timer" size={16} color={colors.primary} />
          <Text style={styles.summaryText}>
            {Math.floor(reportData.duration / 60)}:{(reportData.duration % 60)
              .toString()
              .padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="text" size={16} color={colors.primary} />
          <Text style={styles.summaryText}>{reportData.wordCount} words</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="star" size={16} color={colors.primary} />
          <Text style={styles.summaryText}>
            Score: {reportData.overallScore.toFixed(1)}/100
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.xs,
  },
  sessionType: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.md,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  cardsContainer: {
    height: 380,
    marginVertical: spacing.md,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  labelContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton2: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReportScreen;

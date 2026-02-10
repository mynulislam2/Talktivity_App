/**
 * Report Screen
 * 
 * Post-session feedback and analysis
 * Shows 5-card carousel with scores and recommendations
 * Matches Next.js implementation exactly
 */

import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useReportGeneration } from '@/hooks/report/useReportGeneration';
import { useReportNavigation } from '@/hooks/report/useReportNavigation';
import { useReportCompletion } from '@/hooks/report/useReportCompletion';
import { useReportCalculations } from '@/hooks/report/useReportCalculations';
import { EnglishScoreCard } from '@/components/report/EnglishScoreCard';
import { FluencyCard } from '@/components/report/FluencyCard';
import { GrammarCard } from '@/components/report/GrammarCard';
import { VocabularyCard } from '@/components/report/VocabularyCard';
import { DiscourseCard } from '@/components/report/DiscourseCard';
import { ReportLoadingCard } from '@/components/report/ReportLoadingCard';
import { ReportErrorCard } from '@/components/report/ReportErrorCard';
import type { ReportScreenProps } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

// Support both Auth stack and LearningStack navigation
type ReportScreenPropsUnion = 
  | ReportScreenProps
  | NativeStackScreenProps<AuthStackParamList, 'ReportScreen'>;

function ReportScreenContent() {
  // Custom hooks (matches Next.js exactly)
  // IMPORTANT: All hooks must be called before any early returns
  const {
    reportData,
    loading,
    error,
    generating,
    refreshReport,
  } = useReportGeneration(true); // Auto-fetch on mount

  const {
    overallScores,
    radarData,
  } = useReportCalculations(reportData);

  const {
    currentStep,
    handleContinue,
  } = useReportNavigation({
    reportData,
    totalSteps: 5,
  });

  const { completeReport } = useReportCompletion();

  // Animation for card transitions
  // Must be called before early returns to maintain hook order
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, fadeAnim]);

  // Handle finish - complete report and navigate
  const handleFinish = async () => {
    await completeReport();
  };

  // Render loading state
  if (loading || generating) {
    return (
      <ReportLoadingCard
        loadingMessage="Analyzing your conversation and generating your personalized report..."
      />
    );
  }

  // Render error state
  if (error || !reportData) {
    return (
      <ReportErrorCard
        error={error}
        onRetry={refreshReport}
      />
    );
  }

  // Early return if no overall scores calculated
  if (!overallScores) {
    return (
      <ReportErrorCard
        error="Unable to calculate report scores"
        onRetry={refreshReport}
      />
    );
  }

  // Define report cards (matches Next.js exactly)
  const pages: React.ReactNode[] = [
    <EnglishScoreCard
      key="english"
      overallScores={overallScores}
      radarData={radarData}
      onContinue={handleContinue}
    />,
    <FluencyCard
      key="fluency"
      fluency={reportData.fluency}
      onContinue={handleContinue}
    />,
    <GrammarCard
      key="grammar"
      grammar={reportData.grammar}
      onContinue={handleContinue}
    />,
    <VocabularyCard
      key="vocabulary"
      vocabulary={reportData.vocabulary}
      onContinue={handleContinue}
    />,
    <DiscourseCard
      key="discourse"
      discourse={reportData.discourse}
      onFinish={handleFinish}
    />,
  ];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateX: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        {pages[currentStep]}
      </Animated.View>
    </View>
  );
}

// Support both Auth stack and LearningStack
const ReportScreen: React.FC<ReportScreenPropsUnion> = ({ navigation, route }) => {
  return <ReportScreenContent />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050110',
    paddingVertical: 20,
  },
  cardContainer: {
    flex: 1,
  },
});

export default ReportScreen;

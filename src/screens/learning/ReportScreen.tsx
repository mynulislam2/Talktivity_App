import React, { useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppBackground } from '../../components/common/AppBackground';
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
import type { HomeStackParamList } from '@/navigation/types';

type ReportScreenPropsUnion =
  | ReportScreenProps
  | NativeStackScreenProps<HomeStackParamList, 'ReportScreen'>;

function ReportScreenContent() {
  const { reportData, phase, error, errorCode, retry } =
    useReportGeneration(true);
  const { overallScores, radarData } = useReportCalculations(reportData);
  const { currentStep, handleContinue } = useReportNavigation({
    reportData,
    totalSteps: 5,
  });
  const { completeReport } = useReportCompletion();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, fadeAnim]);

  const handleFinish = async () => {
    await completeReport();
  };

  // PREPARING → loader
  if (phase === 'preparing' || (!reportData && !error)) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReportLoadingCard loadingMessage="Analyzing your conversation and generating your personalized report..." />
        </SafeAreaView>
      </AppBackground>
    );
  }

  // TALK_MORE or TERMINAL → error card
  if (phase === 'talkMore' || phase === 'terminal' || !reportData) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReportErrorCard error={error} code={errorCode} onRetry={retry} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  if (!overallScores) {
    return (
      <AppBackground>
        <SafeAreaView style={ss.safe} edges={['top']}>
          <ReportErrorCard
            error="Unable to calculate report scores"
            onRetry={retry}
          />
        </SafeAreaView>
      </AppBackground>
    );
  }

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
    <AppBackground>
      <SafeAreaView style={ss.safe} edges={['top']}>
        <Animated.View
          style={[
            ss.cardContainer,
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
      </SafeAreaView>
    </AppBackground>
  );
}

const ReportScreen: React.FC<ReportScreenPropsUnion> = () => {
  return <ReportScreenContent />;
};

const ss = StyleSheet.create({
  safe: { flex: 1 },
  cardContainer: { flex: 1 },
});

export default ReportScreen;

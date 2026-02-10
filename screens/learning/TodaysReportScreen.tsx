/**
 * Today's Report Screen
 * 
 * Daily progress report - matches Next.js /todays-report page
 * Shows step-by-step report cards with enhanced icons for today's report
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCourseStatus, selectCourseStatus } from '@/store/slices/courseSlice';
import { useTodayReportNative } from '@/hooks/report/useTodayReportNative';
import { useReportCalculations } from '@/hooks/report/useReportCalculations';
import { authService } from '@/service/AuthService';
import { EnglishScoreCard } from '@/components/report/EnglishScoreCard';
import { FluencyCard } from '@/components/report/FluencyCard';
import { GrammarCard } from '@/components/report/GrammarCard';
import { VocabularyCard } from '@/components/report/VocabularyCard';
import { DiscourseCard } from '@/components/report/DiscourseCard';
import { ReportLoadingCard } from '@/components/report/ReportLoadingCard';
import { ReportErrorCard } from '@/components/report/ReportErrorCard';
import { Ionicons } from '@expo/vector-icons';

export default function TodaysReportScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const courseStatus = useAppSelector(selectCourseStatus);
  const [step, setStep] = useState(0);
  const fadeAnim = new Animated.Value(1);

  const { report, isLoading, error, isExamDay, refresh, complete } = useTodayReportNative();
  const { overallScores, radarData } = useReportCalculations(report);

  // Ensure course status is available (used to detect exam day)
  useEffect(() => {
    if (!courseStatus) {
      dispatch(loadCourseStatus());
    }
  }, [courseStatus, dispatch]);

  const handleContinue = () => {
    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setStep((prev) => prev + 1);
  };

  const handleFinish = async () => {
    // Complete exam/report server-side (if applicable)
    if (isExamDay) {
      await complete();
    }

    const isAuthenticated = authService.isAuthenticated();
    if (isAuthenticated) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'MainTabs',
          params: {
            screen: 'Home',
          },
        })
      );
    } else {
      (navigation as any).navigate('AuthStack', { screen: 'Signup' });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ReportLoadingCard onContinue={() => {}} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !report) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ReportErrorCard
            error={error}
            title="Daily Report Not Available"
            onRetry={refresh}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Early return if no overall scores calculated
  if (!overallScores) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ReportErrorCard
            error="Unable to calculate report scores"
            title="Daily Report Not Available"
            onRetry={refresh}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Enhanced radar data with icons for today's report
  const enhancedRadarData = radarData.map((item, index) => {
    const icons = ['chatbubble', 'trending-up', 'book', 'link'];
    const iconColors = ['#7B70FF', '#fb923c', '#a78bfa', '#818cf8'];
    const bgColors = ['rgba(59, 130, 246, 0.2)', 'rgba(251, 146, 60, 0.2)', 'rgba(167, 139, 250, 0.2)', 'rgba(129, 140, 248, 0.2)'];
    const descriptions = [
      'Fluency is the ability to speak smoothly and confidently without unnecessary pauses.',
      'Vocabulary is the range of words you know and can use to express your thoughts clearly.',
      'Grammar is the set of rules that structure sentences correctly and meaningfully.',
      'Discourse refers to how ideas are connected and organized in longer speech or writing.',
    ];

    return {
      ...item,
      icon: icons[index],
      iconColor: iconColors[index],
      bgColor: bgColors[index],
      description: descriptions[index],
    };
  });

  // Report pages
  const pages: React.ReactNode[] = [
    overallScores ? (
      <EnglishScoreCard
        key="overview"
        overallScores={overallScores}
        radarData={enhancedRadarData}
        onContinue={handleContinue}
        showIcons={true}
      />
    ) : null,
    <FluencyCard
      key="fluency"
      fluency={report.fluency}
      onContinue={handleContinue}
    />,
    <GrammarCard
      key="grammar"
      grammar={report.grammar}
      onContinue={handleContinue}
    />,
    <VocabularyCard
      key="vocabulary"
      vocabulary={report.vocabulary}
      onContinue={handleContinue}
    />,
    <DiscourseCard
      key="discourse"
      discourse={report.discourse}
      onFinish={handleFinish}
    />,
  ].filter(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {pages[step]}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0923',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
});

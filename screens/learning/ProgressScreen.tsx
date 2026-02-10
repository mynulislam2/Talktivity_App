/**
 * Progress Screen (React Native)
 * 
 * Display user's learning progress and statistics
 * Matches Next.js /progress page implementation.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Header } from '@/components/home';
import { useProgressAnalytics } from '@/hooks/progress/useProgressAnalytics';
import {
  ProgressLoadingState,
  ProgressErrorState,
  LastQuizzesSummary,
  SmartInsight,
  Achievements,
  SummerySection,
  MonthlyTrendChart,
  SkillDev,
  ScoreTrend,
} from '@/components/progress';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { ProgressScreenProps } from '@/navigation/types';

const ProgressScreen: React.FC<ProgressScreenProps> = () => {
  const { analytics, achievements, isLoading, error, refresh } = useProgressAnalytics();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ProgressLoadingState />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ProgressErrorState error={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SmartInsight analytics={analytics} achievements={achievements} />

        {/* Recent quizzes summary */}
        <LastQuizzesSummary />

        {/* Achievements Section */}
        <Achievements analytics={analytics} achievements={achievements} />
        
        {/* Progress Summary Section */}
        <SummerySection analytics={analytics} achievements={achievements} />
        
        {/* Monthly Trends Chart */}
        <MonthlyTrendChart analytics={analytics} achievements={achievements} />
        
        {/* Skill Development Section */}
        <SkillDev analytics={analytics} achievements={achievements} />
        
        {/* Score Trends Section */}
        <ScoreTrend analytics={analytics} achievements={achievements} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050110',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: spacing['2xl'],
  },
});

export default ProgressScreen;

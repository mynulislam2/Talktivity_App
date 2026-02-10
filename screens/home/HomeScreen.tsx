/**
 * Home Screen (React Native)
 * 
 * Main dashboard showing daily lessons and timeline.
 * Matches Next.js /home page implementation.
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { loadCourseStatus, checkAndCreateNextBatch } from '@/store/slices/courseSlice';
import { useHomeData } from '@/hooks/home/useHomeData';
import { useHomeViewMode } from '@/hooks/home/useHomeViewMode';
import { HomeViewToggle, HomeLoadingState, HomeErrorState, Header } from '@/components/home';
import DailyLessons from '@/components/dailylessons/DailyLessons';
import Timeline from '@/components/Timeline/Timeline';
import FullCourseTimeline from '@/components/Timeline/FullCourseTimeline';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { RouteGuard } from '@/components/navigation/RouteGuard';
import type { HomeScreenProps } from '@/navigation/types';

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const dispatch = useAppDispatch();
  const { courseStatus, isLoading, error, retry } = useHomeData();
  const { viewMode, setViewMode } = useHomeViewMode();

  // REMOVED: Focus effect was causing infinite loop
  // useHomeData hook handles course loading and batch checks
  // Components will refresh when courseStatus changes in Redux

  return (
    <RouteGuard
      requireAuth={true}
      requireOnboarding={true}
      requireSubscription={true}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Header />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading && <HomeLoadingState />}
          {/* {error && !isLoading && <HomeErrorState error={error} onRetry={retry} />} */}
          {/* {!isLoading && !error && ( */}
            <>
              <HomeViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
              {viewMode === 'today' && <DailyLessons />}
              {viewMode === 'today' ? (
                courseStatus ? (
                  <Timeline courseStatus={courseStatus} />
                ) : null
              ) : (
                <FullCourseTimeline />
              )}
            </>
          {/* )} */}
        </ScrollView>
      </SafeAreaView>
    </RouteGuard>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
});

export default HomeScreen;

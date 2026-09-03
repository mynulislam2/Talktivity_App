import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/store/hooks';
import { useHomeData } from '@/hooks/home/useHomeData';
import { useHomeViewMode } from '@/hooks/home/useHomeViewMode';
import { useDailyProgress } from '@/hooks/progress/useDailyProgress';
import { usePracticeStatus } from '@/hooks/practice';
import { useDailyBudgetMinutes } from '@/hooks/usePlanFeatures';
import ScreenBackground from '../../components/common/ScreenBackground';
import {
  HomeLoadingState,
  HomeErrorState,
  Header,
  HomeDashboardScreen,
  HomeTodayPlanScreen,
  HomeFullTimelineScreen,
} from '@/components/home';
import { RouteGuard } from '@/components/navigation/RouteGuard';
import type { HomeScreenProps } from '@/navigation/types';

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const { courseStatus, isLoading, error, retry } = useHomeData();
  const { viewMode, setViewMode } = useHomeViewMode();
  const { booleans, refresh: refreshDailyProgress } = useDailyProgress(courseStatus);

  const {
    remainingTime,
    canStartSession,
    isLoading: statusLoading,
    refreshStatus: refreshPracticeStatus,
  } = usePracticeStatus('practice');
  const { practiceMinutes: budgetMinutes } = useDailyBudgetMinutes();

  const practiceMinutes = String(budgetMinutes || 10);
  const remainingTimeDisplay = remainingTime || '5m';
  const hasSpeakingTimeLeft = canStartSession !== false;

  const handleBack = useCallback(() => {
    setViewMode('dashboard');
  }, [setViewMode]);

  // Refresh daily progress and remaining time limits whenever the home screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshDailyProgress();
      refreshPracticeStatus();
    }, [refreshDailyProgress, refreshPracticeStatus])
  );

  const handleSwitchMode = useCallback(
    (mode: 'today' | 'timeline') => {
      setViewMode(mode);
    },
    [setViewMode]
  );

  return (
    <RouteGuard
      requireAuth={true}
      requireOnboarding={true}
      requireSubscription={true}
    >
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {isLoading && <HomeLoadingState />}

        {!isLoading && error && (
          <HomeErrorState error={error} onRetry={retry} />
        )}

        {!isLoading && !error && (
          <>
            {viewMode === 'dashboard' && (
              <>
                <Header />
                <HomeDashboardScreen
                  practiceMinutes={practiceMinutes}
                  onOpenTodayPlan={() => setViewMode('today')}
                />
              </>
            )}

            {viewMode === 'today' && courseStatus && (
              <HomeTodayPlanScreen
                courseStatus={courseStatus}
                booleans={booleans}
                practiceMinutes={practiceMinutes}
                remainingTime={remainingTimeDisplay}
                hasSpeakingTimeLeft={hasSpeakingTimeLeft}
                onBack={handleBack}
                onSwitchMode={handleSwitchMode}
              />
            )}

            {viewMode === 'timeline' && (
              <HomeFullTimelineScreen
                currentWeek={courseStatus?.course?.currentWeek || 1}
                onBack={handleBack}
                onSwitchMode={handleSwitchMode}
              />
            )}
          </>
        )}
        </SafeAreaView>
      </ScreenBackground>
    </RouteGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;


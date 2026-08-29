import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const navigation = useNavigation<any>();
  const { courseStatus, isLoading, error, retry } = useHomeData();
  const { viewMode, setViewMode } = useHomeViewMode();
  const { booleans, refresh: refreshDailyProgress } = useDailyProgress(courseStatus);
  const subscriptionState = useAppSelector((state) => state.subscription);
  const planType =
    subscriptionState?.currentSubscription?.subscription?.plan_type;
  const hasGeneralPractice =
    planType === 'BD_3Month' ||
    (typeof planType === 'string' && planType.startsWith('International_'));

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

  const handleStartGeneralPractice = useCallback(() => {
    if (!hasGeneralPractice) return;
    AsyncStorage.setItem(
      'selectedTopic',
      JSON.stringify({ title: 'General Practice', id: 'general' })
    );
    navigation.navigate('GeneralPracticeScreen');
  }, [hasGeneralPractice, navigation]);

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
                  onStartGeneralPractice={handleStartGeneralPractice}
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


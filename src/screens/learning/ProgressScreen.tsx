/**
 * Progress Screen (React Native)
 *
 * Achievements page — matches frontend /progress page exactly.
 * Shows badge showcase and certificates teaser.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProgressAnalytics } from '@/hooks/progress/useProgressAnalytics';
import {
  AchievementBadgeShowcase,
  CertificatesTeaserCard,
  ProgressLoadingState,
  ProgressErrorState,
} from '@/components/progress';
import { ProgressPageShell, ProgressScreenHeader } from '@/components/profile';
import { colors } from '@/styles/colors';
import ScreenBackground from '../../components/common/ScreenBackground';
import type { ProgressScreenProps } from '@/navigation/types';

const ProgressScreen: React.FC<ProgressScreenProps> = () => {
  const navigation = useNavigation<any>();
  const { achievements, isLoading, error, refresh } = useProgressAnalytics();

  if (isLoading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <ProgressLoadingState />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  if (error) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <ProgressErrorState error={error} onRetry={refresh} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
      <ProgressPageShell
        activeTab="achievements"
        header={
          <ProgressScreenHeader
            onSettingsClick={() =>
              navigation.navigate('ProfileStack', { screen: 'SettingsScreen' })
            }
          />
        }
      >
        <View style={styles.content}>
          <AchievementBadgeShowcase achievements={achievements} />
          <CertificatesTeaserCard />
        </View>
      </ProgressPageShell>
    </SafeAreaView>
   </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    gap: 16,
  },
});

export default ProgressScreen;

/**
 * Free Trial Success Screen - Confirmation after trial activation
 * 
 * Shows:
 * - Success confirmation
 * - Trial duration countdown
 * - What to do next
 * - Suggested first steps
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { loadSubscriptionStatus } from '../../store/slices/subscriptionSlice';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface FreeTrialSuccessScreenProps {
  navigation: any;
  route: any;
}

const FreeTrialSuccessScreen: React.FC<FreeTrialSuccessScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [daysRemaining] = useState(7);

  useEffect(() => {
    // Refresh subscription status
    dispatch(loadSubscriptionStatus());
  }, [dispatch]);

  const handleStartLearning = () => {
    navigation.replace('Main');
  };

  const handleViewPlans = () => {
    navigation.navigate('Profile', { screen: 'SubscriptionPlans' });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-done-sharp" size={60} color={colors.primary} />
        </View>
        <Text style={styles.successTitle}>Trial Activated! 🎉</Text>
        <Text style={styles.successSubtitle}>
          You're all set to start learning English
        </Text>
      </View>

      {/* Countdown Card */}
      <View style={styles.countdownCard}>
        <View style={styles.countdownContent}>
          <View style={styles.timerCircle}>
            <Text style={styles.timerDays}>{daysRemaining}</Text>
            <Text style={styles.timerLabel}>Days Left</Text>
          </View>

          <View style={styles.countdownInfo}>
            <Text style={styles.countdownTitle}>Your Free Trial</Text>
            <Text style={styles.countdownText}>
              You have {daysRemaining} days of unlimited access to all premium features.
            </Text>
          </View>
        </View>

        <View style={styles.countdownDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Daily Limit</Text>
              <Text style={styles.detailValue}>60 minutes</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="library" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Access</Text>
              <Text style={styles.detailValue}>500+ scenarios</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <View>
              <Text style={styles.detailLabel}>Features</Text>
              <Text style={styles.detailValue}>All premium</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Next Steps */}
      <View style={styles.nextStepsCard}>
        <Text style={styles.cardTitle}>Next Steps to Get Started</Text>

        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Complete Your Profile</Text>
              <Text style={styles.stepDesc}>
                Add your learning goals and preferred topics
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose Your First Topic</Text>
              <Text style={styles.stepDesc}>
                Browse topics and select what interests you
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start Speaking</Text>
              <Text style={styles.stepDesc}>
                Practice with AI and get instant feedback
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Track Your Progress</Text>
              <Text style={styles.stepDesc}>
                View detailed reports and improvement metrics
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Highlight */}
      <View style={styles.featuresCard}>
        <Text style={styles.cardTitle}>Your Trial Includes</Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Unlimited conversation time (60 min/day)</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Access to 500+ roleplay scenarios</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Advanced analytics and detailed reports</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Priority customer support</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Personalized learning path</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color={colors.primary} />
            <Text style={styles.featureText}>Community access and networking</Text>
          </View>
        </View>
      </View>

      {/* Important Notice */}
      <View style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.noticeTitle}>Important</Text>
        </View>
        <Text style={styles.noticeText}>
          Your trial expires in {daysRemaining} days. After that, your account will automatically downgrade to the Free plan (5 min/day). Upgrade before expiration to maintain premium access.
        </Text>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartLearning}
      >
        <Ionicons name="rocket" size={20} color="#fff" />
        <Text style={styles.startButtonText}>Start Learning Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Profile', { screen: 'SubscriptionPlans' })}
      >
        <Text style={styles.exploreButtonText}>Explore Premium Plans</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>

      {/* Benefits Note */}
      <View style={styles.benefitsNote}>
        <Ionicons name="star" size={18} color="#f59e0b" />
        <Text style={styles.benefitsNoteText}>
          Upgrade within your trial for a discount on annual plans!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  successHeader: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  countdownCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  countdownContent: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  timerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerDays: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  timerLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  countdownInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  countdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  countdownText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  countdownDetails: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '700',
  },
  nextStepsCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    gap: spacing.xs,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  featuresCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  noticeCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  noticeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  exploreButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsNote: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  benefitsNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 16,
  },
});

export default FreeTrialSuccessScreen;

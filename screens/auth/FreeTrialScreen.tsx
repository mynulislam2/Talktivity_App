/**
 * Free Trial Screen - Free trial activation
 * 
 * Shows:
 * - Trial benefits and features
 * - Duration and limitations
 * - Featured content
 * - Activation button
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface FreeTrialScreenProps {
  navigation: any;
}

const FreeTrialScreen: React.FC<FreeTrialScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleActivateTrial = async () => {
    setLoading(true);

    try {
      // TODO: Call API to activate free trial
      // const response = await subscriptionService.startFreeTrial();

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.replace('FreeTrialSuccess');
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to activate free trial. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Ionicons name="star" size={60} color="#f59e0b" />
        </View>
        <Text style={styles.heroTitle}>7-Day Free Trial</Text>
        <Text style={styles.heroSubtitle}>
          Experience premium English learning with no credit card required
        </Text>
      </View>

      {/* Trial Benefits Card */}
      <View style={styles.benefitsCard}>
        <Text style={styles.cardTitle}>What You Get in Your Free Trial</Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="time" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>60 Minutes Per Day</Text>
              <Text style={styles.benefitDesc}>
                Access unlimited speaking practice
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="library" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>500+ Scenarios</Text>
              <Text style={styles.benefitDesc}>
                Roleplay conversations and practice topics
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="bar-chart" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Analytics</Text>
              <Text style={styles.benefitDesc}>
                Track your progress with detailed insights
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="person-circle" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority Support</Text>
              <Text style={styles.benefitDesc}>
                Get help from our support team anytime
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="school" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Personalized Path</Text>
              <Text style={styles.benefitDesc}>
                Customized learning plan based on your goals
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="chatbubbles" size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Community Access</Text>
              <Text style={styles.benefitDesc}>
                Connect with other English learners worldwide
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Trial Duration Card */}
      <View style={styles.durationCard}>
        <View style={styles.durationHeader}>
          <Ionicons name="calendar" size={24} color={colors.primary} />
          <Text style={styles.durationTitle}>Trial Duration</Text>
        </View>
        <View style={styles.durationGrid}>
          <View style={styles.durationItem}>
            <Text style={styles.durationValue}>7</Text>
            <Text style={styles.durationLabel}>Days</Text>
          </View>
          <View style={styles.durationItem}>
            <Text style={styles.durationValue}>No</Text>
            <Text style={styles.durationLabel}>Credit Card</Text>
          </View>
          <View style={styles.durationItem}>
            <Text style={styles.durationValue}>Cancel</Text>
            <Text style={styles.durationLabel}>Anytime</Text>
          </View>
        </View>
      </View>

      {/* What's Included After Trial */}
      <View style={styles.afterTrialCard}>
        <Text style={styles.cardTitle}>After Your Trial</Text>
        <View style={styles.afterTrialContent}>
          <Text style={styles.afterTrialText}>
            After your 7-day trial ends, your account will revert to the Basic plan (5 min/day) at no charge.
          </Text>
          <Text style={styles.afterTrialHighlight}>
            💡 Upgrade to Pro anytime for premium features!
          </Text>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.cardTitle}>Common Questions</Text>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Can I cancel anytime?</Text>
          <Text style={styles.faqAnswer}>
            Yes! You can cancel your trial at any time with no penalties.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ Do I need a credit card?</Text>
          <Text style={styles.faqAnswer}>
            No credit card is required to start your free trial.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.faqQuestion}>❓ What if I don't upgrade?</Text>
          <Text style={styles.faqAnswer}>
            Your account automatically converts to the free Basic plan after 7 days.
          </Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaText}>
          Ready to accelerate your English learning journey?
        </Text>

        <TouchableOpacity
          style={styles.activateButton}
          onPress={handleActivateTrial}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="flash" size={20} color="#fff" />
              <Text style={styles.activateButtonText}>Activate Free Trial</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Continue with Basic Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Trust Badges */}
      <View style={styles.trustSection}>
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <Text style={styles.trustText}>Secure & Private</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} />
          <Text style={styles.trustText}>No Auto-Charge</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="checkmark-done" size={20} color={colors.primary} />
          <Text style={styles.trustText}>Easy Cancel</Text>
        </View>
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
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
    gap: spacing.xs,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  benefitDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  durationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  durationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  durationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  durationItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  durationLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  afterTrialCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: '#dcfce7',
    gap: spacing.md,
  },
  afterTrialContent: {
    gap: spacing.md,
  },
  afterTrialText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  afterTrialHighlight: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
    lineHeight: 18,
  },
  faqSection: {
    gap: spacing.lg,
  },
  faqItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  faqAnswer: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  ctaSection: {
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  activateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  activateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  trustBadge: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  trustText: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FreeTrialScreen;

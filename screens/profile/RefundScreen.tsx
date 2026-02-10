/**
 * Refund Screen (React Native)
 *
 * Displays Talktivity's refund policy.
 * Matches Next.js /refund page implementation.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface RefundScreenProps {
  navigation: any;
}

const RefundScreen: React.FC<RefundScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction */}
        <Text style={styles.introText}>
          At Talktivity, we want you to be completely satisfied with your learning experience. Our
          refund policy is designed to be fair and transparent.
        </Text>

        {/* Section 1: Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Eligibility for Refund</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Users who have used the app for less than 3-4 days may be eligible for a refund." />
            <BulletPoint text="Refund requests must be submitted after the initial 3-4 days of usage." />
            <BulletPoint text="Only one refund request per user account will be considered." />
          </View>
        </View>

        {/* Section 2: Non-Eligibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Non-Eligibility for Refund</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Users who have used the app for more than 4 days are not eligible for a refund." />
            <BulletPoint text="Refund requests submitted before completing 3 days of usage will not be processed." />
            <BulletPoint text="Accounts that have violated our Terms of Service are not eligible for refunds." />
          </View>
        </View>

        {/* Section 3: How to Apply */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How to Apply for a Refund</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Ensure you meet the eligibility criteria outlined above." />
            <View style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Contact our support team at{' '}
                <Text style={styles.emailLink}>support@talktivity.com</Text> with your request.
              </Text>
            </View>
            <BulletPoint text="Include your account details and reason for the refund request." />
            <BulletPoint text="Our team will review your request and respond within 5-7 business days." />
          </View>
        </View>

        {/* Section 4: Refund Process */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Refund Process</Text>
          <View style={styles.bulletList}>
            <BulletPoint text="Approved refunds will be processed to the original payment method." />
            <BulletPoint text="Processing time may vary depending on your payment provider." />
            <BulletPoint text="You will receive a confirmation email once the refund is processed." />
          </View>
        </View>

        {/* Section 5: Changes to Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Changes to This Policy</Text>
          <Text style={styles.bodyText}>
            We may update this Refund Policy from time to time. Continued use of Talktivity means
            you accept any changes.
          </Text>
        </View>

        {/* Section 6: Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions about our Refund Policy, please contact us at{' '}
            <Text style={styles.emailLink}>support@talktivity.com</Text>.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

interface BulletPointProps {
  text: string;
}

const BulletPoint: React.FC<BulletPointProps> = ({ text }) => (
  <View style={styles.bulletItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bulletList: {
    gap: spacing.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: colors.text.secondary,
    marginRight: spacing.md,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text.primary,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
  },
  emailLink: {
    color: '#7B70FF',
    textDecorationLine: 'underline',
  },
});

export default RefundScreen;

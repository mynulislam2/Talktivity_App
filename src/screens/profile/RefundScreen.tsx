/**
 * Refund Screen (React Native)
 *
 * Displays Talktivity's refund policy.
 * Matches SettingsScreen header & layout style.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenBackground from '../../components/common/ScreenBackground';

interface RefundScreenProps {
  navigation: any;
}

const BulletPoint: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.bulletItem}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const RefundScreen: React.FC<RefundScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 16, 61) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header matching SettingsScreen */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Refund Policy</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Introduction */}
          <Text style={styles.introText}>
            At Talktivity, we want you to be completely satisfied with your
            learning experience. Our refund policy is designed to be fair and
            transparent.
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
                  <Text style={styles.emailLink}>talktivityai@gmail.com</Text>{' '}
                  with your request.
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
              We may update this Refund Policy from time to time. Continued use of
              Talktivity means you accept any changes.
            </Text>
          </View>

          {/* Section 6: Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Contact Us</Text>
            <Text style={styles.bodyText}>
              If you have any questions about our Refund Policy, please contact us
              at <Text style={styles.emailLink}>talktivityai@gmail.com</Text>.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  headerSpacer: { flex: 1 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 25,
    color: '#fff',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fdfdfd',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fdfdfd',
    marginBottom: 12,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#8C8C8C',
    marginRight: 12,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: '#fdfdfd',
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fdfdfd',
  },
  emailLink: {
    color: '#7B70FF',
    textDecorationLine: 'underline',
  },
});

export default RefundScreen;

/**
 * Auth Privacy Policy Screen
 *
 * Privacy policy for users during onboarding
 * Displays in auth stack with simple back button header
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import ScreenBackground from '../../components/common/ScreenBackground';

type AuthPrivacyScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Privacy'
>;

const AuthPrivacyScreen: React.FC<AuthPrivacyScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Privacy Policy</Text>

        <Section title="1. Introduction">
          <Text style={styles.text}>
            Talktivity ("we," "us," "our," or "Company") is committed to
            protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and otherwise process your personal
            information through our website, mobile application, and other
            online services that link to this Privacy Policy (collectively, the
            "Service").
          </Text>
        </Section>

        <Section title="2. Information We Collect">
          <Text style={styles.text}>
            We collect information you provide directly, such as when you create
            an account, complete your profile, make a purchase, or contact us
            for support. This includes:
          </Text>
          <Text style={styles.bulletPoint}>
            • Name, email, and contact information
          </Text>
          <Text style={styles.bulletPoint}>
            • Account credentials and authentication information
          </Text>
          <Text style={styles.bulletPoint}>
            • Payment information (processed securely through third parties)
          </Text>
          <Text style={styles.bulletPoint}>
            • Profile information and learning preferences
          </Text>
          <Text style={styles.bulletPoint}>
            • Communications and feedback you provide
          </Text>
        </Section>

        <Section title="3. How We Use Your Information">
          <Text style={styles.text}>
            We use the information we collect for various purposes, including:
          </Text>
          <Text style={styles.bulletPoint}>
            • Providing, maintaining, and improving the Service
          </Text>
          <Text style={styles.bulletPoint}>
            • Processing transactions and sending related information
          </Text>
          <Text style={styles.bulletPoint}>
            • Personalizing your learning experience
          </Text>
          <Text style={styles.bulletPoint}>
            • Sending promotional communications (with your consent)
          </Text>
          <Text style={styles.bulletPoint}>
            • Responding to your inquiries and providing customer support
          </Text>
          <Text style={styles.bulletPoint}>
            • Complying with legal obligations
          </Text>
        </Section>

        <Section title="4. Information Sharing">
          <Text style={styles.text}>
            We do not sell, trade, or rent your personal information to third
            parties. We may share information with:
          </Text>
          <Text style={styles.bulletPoint}>
            • Service providers who assist us in operating the Service
          </Text>
          <Text style={styles.bulletPoint}>
            • Payment processors for transaction handling
          </Text>
          <Text style={styles.bulletPoint}>
            • Legal authorities when required by law
          </Text>
          <Text style={styles.bulletPoint}>
            • Business partners with your explicit consent
          </Text>
        </Section>

        <Section title="5. Data Security">
          <Text style={styles.text}>
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of
            transmission over the Internet is 100% secure, and we cannot
            guarantee absolute security.
          </Text>
        </Section>

        <Section title="6. Cookies and Tracking">
          <Text style={styles.text}>
            We use cookies and similar tracking technologies to enhance your
            experience, analyze usage patterns, and remember your preferences.
            You can control cookie preferences through your browser settings.
          </Text>
        </Section>

        <Section title="7. Your Rights">
          <Text style={styles.text}>
            Depending on your location, you may have rights including:
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to access your personal information
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to correct inaccurate information
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to request deletion of your information
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to opt-out of marketing communications
          </Text>
        </Section>

        <Section title="8. Children's Privacy">
          <Text style={styles.text}>
            The Service is not directed to children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If we become aware that we have collected information from a child
            under 13, we will take steps to delete such information and
            terminate the child's account.
          </Text>
        </Section>

        <Section title="9. Third-Party Links">
          <Text style={styles.text}>
            The Service may contain links to third-party websites. We are not
            responsible for the privacy practices of these external sites. We
            encourage you to review the privacy policies of any third-party
            services before providing your information.
          </Text>
        </Section>

        <Section title="10. Changes to This Policy">
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the new Privacy Policy on this
            page and updating the "Last Updated" date. Your continued use of the
            Service constitutes your acceptance of the updated Privacy Policy.
          </Text>
        </Section>

        <Section title="11. Contact Us">
          <Text style={styles.text}>
            If you have questions about this Privacy Policy or our privacy
            practices, please contact us at:
          </Text>
          <Text style={styles.bulletPoint}>
            • Email: privacy@talktivity.com
          </Text>
          <Text style={styles.bulletPoint}>
            • Address: [Your Company Address]
          </Text>
        </Section>

        <Text style={styles.lastUpdated}>Last Updated: February 26, 2026</Text>
      </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 22,
    marginBottom: spacing.md,
    fontWeight: '400', fontFamily: 'Poppins',
  },
  bulletPoint: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 22,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: '400', fontFamily: 'Poppins',
  },
  lastUpdated: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 1)',
    marginTop: spacing.xl,
    fontStyle: 'italic',
  },
});

export default AuthPrivacyScreen;

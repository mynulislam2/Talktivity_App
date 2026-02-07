/**
 * Privacy Policy Screen
 * 
 * Shows:
 * - Privacy policy content
 * - Data collection practices
 * - User rights information
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PrivacyScreenProps {
  navigation: any;
  route: any;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSubtitle}>
            Last updated: January 2026
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.sectionText}>
            Talktivity ("we," "us," "our," or "Company") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our Service.
          </Text>
        </View>

        {/* Information We Collect */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          
          <Text style={styles.subsectionTitle}>2.1 Personal Data</Text>
          <Text style={styles.sectionText}>
            We may collect personally identifiable information, including but not limited to:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• Name</Text>
            <Text style={styles.listItem}>• Email address</Text>
            <Text style={styles.listItem}>• Phone number</Text>
            <Text style={styles.listItem}>• Username and password</Text>
            <Text style={styles.listItem}>• Learning history and progress</Text>
            <Text style={styles.listItem}>• Payment information</Text>
          </View>

          <Text style={styles.subsectionTitle}>2.2 Automatic Information</Text>
          <Text style={styles.sectionText}>
            When you access our Service, we automatically collect certain information,
            including:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• IP address</Text>
            <Text style={styles.listItem}>• Device type and model</Text>
            <Text style={styles.listItem}>• Operating system</Text>
            <Text style={styles.listItem}>• Browsing history on our Service</Text>
            <Text style={styles.listItem}>• Usage patterns and analytics</Text>
          </View>

          <Text style={styles.subsectionTitle}>2.3 Audio and Video Data</Text>
          <Text style={styles.sectionText}>
            When you use our voice learning features, we record and store audio of your
            speech for educational feedback and improvement purposes only.
          </Text>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use the information we collect for various purposes:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• Providing and improving our Service</Text>
            <Text style={styles.listItem}>• Personalizing your learning experience</Text>
            <Text style={styles.listItem}>• Processing payments and transactions</Text>
            <Text style={styles.listItem}>• Sending educational content and updates</Text>
            <Text style={styles.listItem}>• Analyzing usage patterns to improve functionality</Text>
            <Text style={styles.listItem}>• Detecting and preventing fraud and abuse</Text>
            <Text style={styles.listItem}>• Complying with legal obligations</Text>
          </View>
        </View>

        {/* Sharing of Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
          <Text style={styles.sectionText}>
            We do not sell your personal information. We may share your information:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>
              • With service providers (payment processors, analytics services)
            </Text>
            <Text style={styles.listItem}>
              • When required by law or legal process
            </Text>
            <Text style={styles.listItem}>
              • To protect our rights and prevent abuse
            </Text>
            <Text style={styles.listItem}>
              • With your consent for specific purposes
            </Text>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.sectionText}>
            We implement administrative, technical, and physical security measures to
            protect your personal information. However, no method of transmission over the
            internet is completely secure. We cannot guarantee absolute security.
          </Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your personal information for as long as needed to provide our
            Service and fulfill the purposes outlined in this Privacy Policy. You can
            request deletion of your data at any time, subject to legal obligations.
          </Text>
        </View>

        {/* Your Privacy Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Your Privacy Rights</Text>
          <Text style={styles.sectionText}>
            Depending on your location, you may have the following rights:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• Right to access your personal data</Text>
            <Text style={styles.listItem}>• Right to correct inaccurate data</Text>
            <Text style={styles.listItem}>• Right to delete your data</Text>
            <Text style={styles.listItem}>• Right to restrict processing</Text>
            <Text style={styles.listItem}>• Right to data portability</Text>
            <Text style={styles.listItem}>• Right to withdraw consent</Text>
          </View>
          <Text style={styles.sectionText}>
            To exercise these rights, please contact us at privacy@talktivity.com
          </Text>
        </View>

        {/* Cookies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            We use cookies and similar tracking technologies to enhance your experience.
            You can control cookie preferences through your browser settings.
          </Text>
        </View>

        {/* Third-Party Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
          <Text style={styles.sectionText}>
            Our Service may include links to third-party websites and services. We are not
            responsible for their privacy practices. We encourage you to review their
            privacy policies.
          </Text>
        </View>

        {/* Children's Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our Service is not intended for users under 13 years old. We do not knowingly
            collect personal information from children under 13. If we learn we have
            collected such information, we will delete it promptly.
          </Text>
        </View>

        {/* Changes to Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Changes to Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy periodically. We will notify you of
            significant changes by email or through our Service.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have questions about this Privacy Policy or our privacy practices,
            please contact us:
          </Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text style={styles.contactText}>privacy@talktivity.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="globe" size={20} color={colors.primary} />
              <Text style={styles.contactText}>www.talktivity.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
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
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  listItems: {
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  listItem: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  contactText: {
    flex: 1,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default PrivacyScreen;

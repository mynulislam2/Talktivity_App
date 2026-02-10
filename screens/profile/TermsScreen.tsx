/**
 * Terms of Service Screen
 * 
 * Shows:
 * - Terms and conditions content
 * - Legal text
 * - Acceptance checkbox for new users
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface TermsScreenProps {
  navigation: any;
  route: any;
}

const TermsScreen: React.FC<TermsScreenProps> = ({ navigation }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (!accepted) {
      Alert.alert('Please Accept', 'You must accept the terms to continue');
      return;
    }
    Alert.alert('Terms Accepted', 'You have accepted our Terms of Service');
    navigation.goBack();
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerSubtitle}>
            Last updated: January 2026
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.sectionText}>
            Welcome to Talktivity. These Terms of Service ("Terms") govern your use of our
            platform, website, and mobile applications (collectively, the "Service").
            By accessing or using Talktivity, you agree to be bound by these Terms. If you
            do not agree to any part of these terms, you may not use our Service.
          </Text>
        </View>

        {/* Use License */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use License</Text>
          <Text style={styles.sectionText}>
            Talktivity grants you a limited, non-exclusive, non-transferable license to use
            our Service for personal, non-commercial purposes. You agree to use the
            Service only in accordance with these Terms and applicable laws.
          </Text>
          <Text style={styles.sectionText}>
            You agree not to:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• Modify or copy materials from the Service</Text>
            <Text style={styles.listItem}>• Use materials for any commercial purpose</Text>
            <Text style={styles.listItem}>• Attempt to decompile or reverse engineer software</Text>
            <Text style={styles.listItem}>• Remove copyright or proprietary notations</Text>
            <Text style={styles.listItem}>• Transfer materials to yourself or third parties</Text>
            <Text style={styles.listItem}>• Harass or cause distress or inconvenience to any person</Text>
            <Text style={styles.listItem}>• Transmit obscene or offensive content</Text>
            <Text style={styles.listItem}>
              • Disrupt the flow of dialogue in interactive environments
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Disclaimer</Text>
          <Text style={styles.sectionText}>
            The materials on Talktivity are provided for educational purposes. We make no
            warranties, expressed or implied, regarding these materials. We further disclaim
            all warranties including the warranty of fitness for a particular purpose.
            Further, we do not warrant the accuracy, timeliness, or completeness of the
            materials, services, or information contained herein.
          </Text>
        </View>

        {/* Limitations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitations of Liability</Text>
          <Text style={styles.sectionText}>
            In no event shall Talktivity be liable for any damages (including, without
            limitation, lost revenue, lost profits, or lost data) even if we have been
            notified orally or in writing of the possibility of such damage.
          </Text>
        </View>

        {/* Accuracy of Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Accuracy of Materials</Text>
          <Text style={styles.sectionText}>
            We do not warrant that the materials on our Service are accurate, complete,
            or current. We may make changes to the materials at any time without notice.
          </Text>
        </View>

        {/* User Conduct */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. User Conduct</Text>
          <Text style={styles.sectionText}>
            You agree that you will not upload, post, or transmit any materials that:
          </Text>
          <View style={styles.listItems}>
            <Text style={styles.listItem}>• Violate any laws, regulations, or third-party rights</Text>
            <Text style={styles.listItem}>• Are abusive, threatening, or harassing</Text>
            <Text style={styles.listItem}>• Contain viruses or malicious code</Text>
            <Text style={styles.listItem}>• Are spam or commercial solicitations</Text>
            <Text style={styles.listItem}>• Impersonate another person</Text>
          </View>
        </View>

        {/* Payment Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Payment Terms</Text>
          <Text style={styles.sectionText}>
            For paid subscriptions, you authorize us to charge the payment method on file
            for the subscription fee on a recurring basis. You may cancel your subscription
            at any time through your account settings.
          </Text>
          <Text style={styles.sectionText}>
            All fees are exclusive of applicable taxes. You are responsible for any
            applicable sales, use, or other taxes.
          </Text>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Cancellation Policy</Text>
          <Text style={styles.sectionText}>
            You may cancel your subscription at any time. Cancellations take effect at the
            end of your current billing period. No refunds will be provided for partial
            months or cancellations made during a billing period.
          </Text>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Intellectual Property Rights</Text>
          <Text style={styles.sectionText}>
            All materials on the Talktivity Service, including text, graphics, logos,
            images, audio, and video, are the property of Talktivity or its content
            suppliers and are protected by international copyright laws.
          </Text>
        </View>

        {/* Modifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifications to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these Terms at any time. Your continued use of
            the Service following the posting of revised Terms means that you accept and
            agree to the changes.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Governing Law</Text>
          <Text style={styles.sectionText}>
            These Terms and Conditions are governed by and construed in accordance with
            the laws of Bangladesh, and you irrevocably submit to the exclusive jurisdiction
            of the courts in that location.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have questions about these Terms, please contact us at
            support@talktivity.com
          </Text>
        </View>
      </ScrollView>

      {/* Acceptance Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
            {accepted && (
              <Ionicons name="checkmark" size={18} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the Terms of Service
          </Text>
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, !accepted && styles.acceptButtonDisabled]}
            onPress={handleAccept}
            disabled={!accepted}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
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
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

export default TermsScreen;

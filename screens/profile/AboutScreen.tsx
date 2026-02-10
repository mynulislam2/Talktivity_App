/**
 * About Screen - About Talktivity
 * 
 * Shows:
 * - Company mission and vision
 * - App features
 * - Team information
 * - Social media links
 * - Version info
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface AboutScreenProps {
  navigation: any;
  route: any;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ navigation }) => {
  const appVersion = '1.0.0';

  const handleSocialPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:hello@talktivity.com');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="mic-circle" size={80} color={colors.primary} />
        </View>
        <Text style={styles.appName}>Talktivity</Text>
        <Text style={styles.tagline}>Master English Through Conversation</Text>
        <Text style={styles.version}>Version {appVersion}</Text>
      </View>

      {/* Mission Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Our Mission</Text>
        <Text style={styles.cardText}>
          At Talktivity, we believe everyone should have access to quality English
          learning resources. Our mission is to make English conversation practice fun,
          affordable, and accessible to learners worldwide through AI-powered,
          interactive voice lessons.
        </Text>
      </View>

      {/* Vision Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Our Vision</Text>
        <Text style={styles.cardText}>
          We envision a world where language barriers no longer limit personal growth,
          career opportunities, and global connections. We're building the most engaging
          and effective English learning platform powered by cutting-edge AI technology.
        </Text>
      </View>

      {/* Key Features */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Why Talktivity?</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="mic" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Real Voice Practice</Text>
              <Text style={styles.featureDesc}>
                Speak with AI that understands natural English conversation
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Detailed Feedback</Text>
              <Text style={styles.featureDesc}>
                Get immediate insights on grammar, vocabulary, and fluency
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="library" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Hundreds of Topics</Text>
              <Text style={styles.featureDesc}>
                Practice conversations across real-world scenarios and situations
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Progress</Text>
              <Text style={styles.featureDesc}>
                Monitor your improvement with detailed analytics and reports
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Learn on Your Schedule</Text>
              <Text style={styles.featureDesc}>
                Practice anytime, anywhere with unlimited access on premium
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="happy" size={20} color={colors.primary} />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Personalized Learning</Text>
              <Text style={styles.featureDesc}>
                AI adapts difficulty and topics to match your skill level
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Team Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Our Team</Text>
        <Text style={styles.cardText}>
          Talktivity is built by a passionate team of educators, engineers, and
          language experts committed to making English learning accessible and effective
          for everyone.
        </Text>
        <TouchableOpacity
          style={styles.teamButton}
          onPress={() => handleEmailPress()}
        >
          <Ionicons name="mail" size={16} color={colors.primary} />
          <Text style={styles.teamButtonText}>Meet the Team</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Active Users</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Topics</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Technology */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Powered By</Text>
        <View style={styles.techStack}>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>LiveKit</Text>
          </View>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>Groq AI</Text>
          </View>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>React Native</Text>
          </View>
          <View style={styles.techBadge}>
            <Text style={styles.techBadgeText}>Node.js</Text>
          </View>
        </View>
      </View>

      {/* Follow Us */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Follow Us</Text>
        <View style={styles.socialLinks}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress('https://twitter.com/talktivity')}
          >
            <Ionicons name="logo-twitter" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress('https://facebook.com/talktivity')}
          >
            <Ionicons name="logo-facebook" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress('https://instagram.com/talktivity')}
          >
            <Ionicons name="logo-instagram" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialPress('https://linkedin.com/company/talktivity')}
          >
            <Ionicons name="logo-linkedin" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleEmailPress()}
          >
            <Ionicons name="mail" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Get in Touch</Text>
        <View style={styles.contactList}>
          <TouchableOpacity
            onPress={() => handleEmailPress()}
            style={styles.contactItem}
          >
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>hello@talktivity.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://talktivity.com')}
            style={styles.contactItem}
          >
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.talktivity.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('https://talktivity.com/support')}
            style={styles.contactItem}
          >
            <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Support</Text>
              <Text style={styles.contactValue}>support@talktivity.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Links */}
      <View style={styles.legalLinks}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Terms')}
        >
          <Text style={styles.legalLink}>Terms of Service</Text>
        </TouchableOpacity>

        <Text style={styles.legalDot}>•</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Privacy')}
        >
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>
          © 2026 Talktivity. All rights reserved.
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
  heroSection: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tagline: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  cardText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
  },
  featuresList: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  featureContent: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 16,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  teamButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.primary + '30',
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  techBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  techBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactList: {
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  contactContent: {
    flex: 1,
    gap: spacing.xs,
  },
  contactLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  contactValue: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  legalLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  legalDot: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  copyrightText: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});

export default AboutScreen;

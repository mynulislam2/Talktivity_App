/**
 * Auth Terms & Conditions Screen
 *
 * Terms and conditions for users during onboarding
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

type AuthTermsScreenProps = NativeStackScreenProps<AuthStackParamList, 'Terms'>;

const AuthTermsScreen: React.FC<AuthTermsScreenProps> = ({ navigation }) => {
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
        <Text style={styles.title}>Terms & Conditions</Text>

        <Section title="1. Agreement to Terms">
          <Text style={styles.text}>
            By accessing and using Talktivity ("the Service"), you accept and
            agree to be bound by the terms and provision of this agreement. If
            you do not agree to abide by the above, please do not use this
            service.
          </Text>
        </Section>

        <Section title="2. Use License">
          <Text style={styles.text}>
            Permission is granted to temporarily download one copy of the
            materials (information or software) on Talktivity for personal,
            non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title, and under this license you may
            not:
          </Text>
          <Text style={styles.bulletPoint}>• Modify or copy the materials</Text>
          <Text style={styles.bulletPoint}>
            • Use the materials for any commercial purpose or for any public
            display
          </Text>
          <Text style={styles.bulletPoint}>
            • Attempt to decompile or reverse engineer any software contained on
            Talktivity
          </Text>
          <Text style={styles.bulletPoint}>
            • Transfer the materials to another person or "mirror" the materials
            on any other server
          </Text>
          <Text style={styles.bulletPoint}>
            • Remove any copyright or other proprietary notations from the
            materials
          </Text>
        </Section>

        <Section title="3. Disclaimer">
          <Text style={styles.text}>
            The materials on Talktivity are provided on an 'as is' basis.
            Talktivity makes no warranties, expressed or implied, and hereby
            disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </Text>
        </Section>

        <Section title="4. Limitations">
          <Text style={styles.text}>
            In no event shall Talktivity or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on Talktivity, even if Talktivity or
            an authorized representative has been notified orally or in writing
            of the possibility of such damage.
          </Text>
        </Section>

        <Section title="5. Accuracy of Materials">
          <Text style={styles.text}>
            The materials appearing on Talktivity could include technical,
            typographical, or photographic errors. Talktivity does not warrant
            that any of the materials on the website are accurate, complete, or
            current. Talktivity may make changes to the materials contained on
            the website at any time without notice.
          </Text>
        </Section>

        <Section title="6. Links">
          <Text style={styles.text}>
            Talktivity has not reviewed all of the sites linked to its website
            and is not responsible for the contents of any such linked site. The
            inclusion of any link does not imply endorsement by Talktivity of
            the site. Use of any such linked website is at the user's own risk.
          </Text>
        </Section>

        <Section title="7. Modifications">
          <Text style={styles.text}>
            Talktivity may revise these terms of service at any time without
            notice. By using this website, you are agreeing to be bound by the
            then current version of these terms of service.
          </Text>
        </Section>

        <Section title="8. Governing Law">
          <Text style={styles.text}>
            These terms and conditions are governed by and construed in
            accordance with applicable law, and you irrevocably submit to the
            exclusive jurisdiction of the courts located in this location.
          </Text>
        </Section>
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
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 22,
    marginBottom: spacing.md,
    fontWeight: '400',
  },
  bulletPoint: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    lineHeight: 22,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    fontWeight: '400',
  },
});

export default AuthTermsScreen;

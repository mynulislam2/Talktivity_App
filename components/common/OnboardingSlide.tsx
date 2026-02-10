/**
 * OnboardingSlide Component
 *
 * Shared layout component for each onboarding slide
 * Premium dark UI matching Next.js design system
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  visual: ReactNode; // Logo, avatar, or feature UI
  headline: string;
  description: string;
}

const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  visual,
  headline,
  description,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Visual Section with Gradient Glow */}
      <View style={styles.visualSection}>
        <View style={styles.glowContainer}>
          {/* Circular gradient glow behind image */}
          <LinearGradient
            colors={[colors.blue[500] + '40', colors.purple[600] + '20', 'transparent']}
            style={styles.gradientGlow}
          />
          <View style={styles.visualContent}>
            {visual}
          </View>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>{headline}</Text>

      {/* Supporting Description */}
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  visualSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3xl'],
  },
  glowContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  visualContent: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight as any,
    color: colors.textDark.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 40,
  },
  description: {
    fontSize: typography.body1.fontSize,
    color: colors.textDark.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
    maxWidth: 320,
  },
});

export default OnboardingSlide;

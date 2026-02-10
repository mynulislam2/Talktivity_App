/**
 * WelcomeOnboardingScreen
 *
 * Premium 3-screen swipeable onboarding carousel
 * Matches Next.js dark theme design system
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import OnboardingSlide from '../../components/common/OnboardingSlide';
import GradientButton from '../../components/common/GradientButton';
import PaginationDots from '../../components/common/PaginationDots';

const { width } = Dimensions.get('window');

interface SlideData {
  id: string;
  headline: string;
  description: string;
  visual: React.ReactNode;
}

// Placeholder visual components (can be replaced with actual images/SVGs)
const LogoVisual = () => (
  <View style={styles.logoContainer}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>T</Text>
    </View>
  </View>
);

const AvatarVisual = () => (
  <View style={styles.avatarContainer}>
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarIcon}>🎤</Text>
    </View>
  </View>
);

const LevelVisual = () => (
  <View style={styles.levelContainer}>
    <View style={styles.levelCard}>
      <Text style={styles.levelIcon}>📊</Text>
      <View style={styles.levelBar} />
      <View style={[styles.levelBar, { width: '70%' }]} />
      <View style={[styles.levelBar, { width: '40%' }]} />
    </View>
  </View>
);

const slides: SlideData[] = [
  {
    id: '1',
    headline: 'Start Speaking Fluently',
    description: 'Discover how Talktivity helps you improve your English through real conversations.',
    visual: <LogoVisual />,
  },
  {
    id: '2',
    headline: 'Practice your speaking anytime, anywhere',
    description: 'Engage in real conversations with your AI tutor.',
    visual: <AvatarVisual />,
  },
  {
    id: '3',
    headline: 'Get personalized plan to level up',
    description: 'We analyze your speaking and generate custom improvement plans.',
    visual: <LevelVisual />,
  },
];

type AuthStackParamList = {
  WelcomeOnboarding: undefined;
  Signup: undefined;
  Login: undefined;
  // Add other routes if needed
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const WelcomeOnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleGetStarted = () => {
    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const renderItem = ({ item }: { item: SlideData }) => (
    <OnboardingSlide
      visual={item.visual}
      headline={item.headline}
      description={item.description}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />

      {/* Slides */}
      <View style={styles.slidesContainer}>
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={false}
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <PaginationDots totalDots={slides.length} activeIndex={currentIndex} />
        </View>

        {/* Primary CTA */}
        <GradientButton
          label="Get Started"
          onPress={handleGetStarted}
          size="large"
          fullWidth
          style={styles.primaryButton}
        />

        {/* Secondary CTA */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>

        {/* Legal Text */}
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  slidesContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomSection: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  paginationContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 100,
    backgroundColor: colors.dark.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.slate[700],
  },
  secondaryButtonText: {
    fontSize: typography.body1.fontSize,
    fontWeight: '600',
    color: colors.textDark.primary,
  },
  legalText: {
    fontSize: 12,
    color: colors.textDark.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.sm,
  },
  legalLink: {
    color: colors.blue[500],
    textDecorationLine: 'underline',
  },
  // Visual placeholder styles
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.white,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.purple[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple[600],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarIcon: {
    fontSize: 72,
  },
  levelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCard: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.dark.backgroundCard,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.slate[700],
    gap: spacing.md,
  },
  levelIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  levelBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue[500],
  },
});

export default WelcomeOnboardingScreen;

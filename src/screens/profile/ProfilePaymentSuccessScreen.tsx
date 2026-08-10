/**
 * Profile Payment Success Screen
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '@/store/hooks';
import { loadSubscriptionStatus } from '@/store/slices/subscriptionSlice';

const ProfilePaymentSuccessScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Proactively refresh subscription status — retry a few times to handle
    // any backend processing delay from the payment gateway callback.
    dispatch(loadSubscriptionStatus());

    const timer1 = setTimeout(() => dispatch(loadSubscriptionStatus()), 2000);
    const timer2 = setTimeout(() => dispatch(loadSubscriptionStatus()), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [dispatch]);

  const handleContinue = async () => {
    // Force one final refresh before navigating back
    await dispatch(loadSubscriptionStatus());
    navigation.navigate('ProfileScreen' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-sharp" size={48} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Plan Updated!</Text>
        <Text style={styles.description}>
          Success! Your new subscription plan is now active. Enjoy your enhanced
          learning experience.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050110' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: { marginBottom: spacing.xl },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: spacing['3xl'],
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});

export default ProfilePaymentSuccessScreen;

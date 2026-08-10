/**
 * Profile Payment Failure Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { useNavigation } from '@react-navigation/native';

const ProfilePaymentFailureScreen = () => {
  const navigation = useNavigation();

  const handleRetry = () => {
    navigation.goBack(); // Back to Checkout
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={48} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.description}>
          Your payment couldn't be processed. Please check your billing
          information and try again.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRetry}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Try Again</Text>
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
    backgroundColor: colors.error,
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

export default ProfilePaymentFailureScreen;

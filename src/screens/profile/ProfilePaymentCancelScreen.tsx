/**
 * Profile Payment Cancel Screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { useNavigation } from '@react-navigation/native';

const ProfilePaymentCancelScreen = () => {
  const navigation = useNavigation<any>();

  const handleGoBack = () => {
    navigation.navigate('ProfileScreen' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="close-sharp"
              size={48}
              color="rgba(255,255,255,0.5)"
            />
          </View>
        </View>
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.description}>
          No changes were made to your subscription. You'll be redirected back
          to your profile.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGoBack}
            activeOpacity={0.88}
          >
            <Text style={styles.buttonText}>Back to Dashboard</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: spacing.lg,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: { fontSize: 18, fontFamily: 'Poppins-Bold', fontWeight: '700', color: '#fff' },
});

export default ProfilePaymentCancelScreen;

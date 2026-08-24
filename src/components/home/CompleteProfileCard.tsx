import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '@/store/hooks';
import { selectProfileCompleted } from '@/store/slices/lifecycleSlice';
import { selectUser } from '@/store/slices/authSlice';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

const DISMISS_KEY_PREFIX = 'profileCompleteCardDismissed:';
function dismissKeyFor(
  userId: string | number | null | undefined
): string | null {
  return userId == null ? null : `${DISMISS_KEY_PREFIX}${userId}`;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const CompleteProfileCard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const profileCompleted = useAppSelector(selectProfileCompleted);
  const user = useAppSelector(selectUser);
  const userId = user?.id ?? null;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const checkDismissal = async () => {
      const key = dismissKeyFor(userId);
      if (!key) {
        setDismissed(true);
        return;
      }
      try {
        const value = await AsyncStorage.getItem(key);
        setDismissed(value === 'true');
      } catch (e) {
        setDismissed(false);
      }
    };
    checkDismissal();
  }, [userId]);

  if (profileCompleted || dismissed) {
    return null;
  }

  const handleDismiss = async () => {
    const key = dismissKeyFor(userId);
    if (key) {
      try {
        await AsyncStorage.setItem(key, 'true');
      } catch (e) {}
    }
    setDismissed(true);
  };

  const handleContinue = () => {
    navigation.navigate('Profile' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Complete your profile</Text>
        </View>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color="#8c8c8c" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
        <Feather
          name="arrow-right"
          size={14}
          color="#fff"
          style={styles.buttonIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  textContainer: {
    flex: 1,
    maxWidth: 240,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 21.6,
    letterSpacing: 0.12,
    color: colors.text.primary,
  },
  description: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: '#c6c6c6',
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: spacing.md,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  buttonIcon: {
    marginLeft: 4,
    transform: [{ rotate: '180deg' }],
  },
});

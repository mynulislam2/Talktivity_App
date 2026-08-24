/**
 * ThemedAlert Component
 *
 * Dark-themed alert dialog matching the app's visual style.
 * Supports single or multiple buttons for confirmation dialogs.
 * Drop-in replacement for React Native's Alert.alert().
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ThemedAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  buttonText?: string;
  buttons?: AlertButton[];
}

const iconMap: Record<
  AlertType,
  { name: keyof typeof Ionicons.glyphMap; color: string }
> = {
  success: { name: 'checkmark-circle', color: '#22c55e' },
  error: { name: 'close-circle', color: '#ef4444' },
  warning: { name: 'warning', color: '#f59e0b' },
  info: { name: 'information-circle', color: '#3b82f6' },
};

export function ThemedAlert({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  buttonText = 'OK',
  buttons,
}: ThemedAlertProps) {
  const icon = iconMap[type];

  // If buttons array provided, use it; otherwise create default OK button
  const buttonsList = buttons || [
    { text: buttonText, onPress: onClose, style: 'default' as const },
  ];

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
  };

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return { backgroundColor: '#ef4444' };
      case 'cancel':
        return { backgroundColor: 'rgba(255, 255, 255, 0.1)' };
      default:
        return { backgroundGradient: true };
    }
  };

  const getButtonTextStyle = (style?: string) => {
    switch (style) {
      case 'destructive':
        return { color: '#ffffff' };
      case 'cancel':
        return { color: 'rgba(255, 255, 255, 0.7)' };
      default:
        return { color: '#ffffff' };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View
            style={[styles.iconCircle, { backgroundColor: `${icon.color}20` }]}
          >
            <Ionicons name={icon.name} size={32} color={icon.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            {buttonsList.map((button, index) => {
              const buttonStyle = getButtonStyle(button.style);
              const isGradient = button.style === 'default' || !button.style;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.85}
                  style={[
                    styles.buttonWrapper,
                    buttonsList.length > 1 && styles.multiButton,
                  ]}
                >
                  {isGradient ? (
                    <LinearGradient
                      colors={['#9333ea', '#3b82f6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.button}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          getButtonTextStyle(button.style),
                        ]}
                      >
                        {button.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.button, buttonStyle]}>
                      <Text
                        style={[
                          styles.buttonText,
                          getButtonTextStyle(button.style),
                        ]}
                      >
                        {button.text}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#0c0820',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '82%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  buttonWrapper: {
    width: '100%',
  },
  multiButton: {
    flex: 1,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    color: '#ffffff',
  },
});

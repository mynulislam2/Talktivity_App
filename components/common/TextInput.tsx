/**
 * TextInput Component
 * 
 * Reusable text input wrapper
 */

import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  helper?: string;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  helper,
  ...props
}) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default TextInput;

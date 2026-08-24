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
  leftIcon?: React.ReactNode;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  error,
  containerStyle,
  helper,
  leftIcon,
  ...props
}) => {
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <RNTextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithIcon : null,
            error ? styles.inputError : null,
          ]}
          placeholderTextColor={colors.text.muted}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helper && !error && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderInput,
    backgroundColor: colors.brand.inputBg,
  },
  inputWrapperError: {
    borderColor: colors.borderInputError,
    backgroundColor: colors.brand.inputErrorBg,
  },
  iconContainer: {
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  inputError: {
    color: colors.text.primary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
});

export default TextInput;

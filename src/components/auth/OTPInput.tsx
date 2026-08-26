/**
 * OTP Input Component
 *
 * A 6-digit OTP input component with auto-advance and backspace handling.
 * Used for password reset and email verification flows.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
  style,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // Convert value string to array of digits
  const digits = value
    .split('')
    .concat(Array(length).fill(''))
    .slice(0, length);

  const focusInput = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[clampedIndex]?.focus();
    setActiveIndex(clampedIndex);
  };

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Only accept digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    if (digit) {
      const newDigits = [...digits];
      newDigits[index] = digit;
      const newValue = newDigits.join('').slice(0, length);
      onChange(newValue);

      // Auto-advance to next input
      if (index < length - 1) {
        focusInput(index + 1);
      }
    }
  };

  const handleKeyPress = (
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (disabled) return;

    const key = e.nativeEvent.key;

    if (key === 'Backspace') {
      const newDigits = [...digits];

      if (digits[index]) {
        // Clear current digit
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        // Move to previous and clear it
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        focusInput(index - 1);
      }
    }
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, style]}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          style={[
            styles.input,
            activeIndex === index && !disabled && styles.inputActive,
            error && styles.inputError,
            disabled && styles.inputDisabled,
          ]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          onFocus={() => handleFocus(index)}
          editable={!disabled}
          selectTextOnFocus
          caretHidden
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  input: {
    // Six boxes at a fixed 42pt plus five 8pt gaps need 292pt; a 320pt screen
    // inside a 20pt gutter has 280pt, so the last box ran off the edge.
    // Sharing the row keeps them square-ish everywhere and identical to the
    // old 42pt once there is room for it.
    flex: 1,
    minWidth: 0,
    maxWidth: 42,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.color.border.input,
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: tokens.color.text.primary,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  inputActive: {
    borderWidth: 1,
    borderColor: tokens.color.accent.primary,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  inputError: {
    borderColor: tokens.color.state.danger,
    backgroundColor: 'rgba(255,35,35,0.10)',
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

export default OTPInput;

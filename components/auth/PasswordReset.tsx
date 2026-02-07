/**
 * Password Reset Component
 * 
 * Reusable password reset component with multi-step flow:
 * 1. Email submission
 * 2. Verification code entry
 * 3. New password setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

type ResetStep = 'email' | 'code' | 'password';

interface PasswordResetProps {
  onEmailSubmit: (email: string) => Promise<void>;
  onCodeSubmit: (code: string) => Promise<void>;
  onPasswordReset: (newPassword: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  style?: ViewStyle;
}

const PasswordReset: React.FC<PasswordResetProps> = ({
  onEmailSubmit,
  onCodeSubmit,
  onPasswordReset,
  loading = false,
  error = null,
  style,
}) => {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async () => {
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return;

    await onEmailSubmit(email);
    setStep('code');
  };

  const handleCodeSubmit = async () => {
    if (!code || code.length < 6) return;

    await onCodeSubmit(code);
    setStep('password');
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) return;

    if (newPassword.length < 6) return;

    if (newPassword !== confirmPassword) return;

    await onPasswordReset(newPassword);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Step 1: Email */}
      {step === 'email' && (
        <>
          <View style={styles.intro}>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a code to reset your password
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleEmailSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Step 2: Verification Code */}
      {step === 'code' && (
        <>
          <View style={styles.intro}>
            <Text style={styles.subtitle}>
              Enter the verification code we sent to {email}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              editable={!loading}
              value={code}
              onChangeText={setCode}
              maxLength={6}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleCodeSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {/* Step 3: New Password */}
      {step === 'password' && (
        <>
          <View style={styles.intro}>
            <Text style={styles.subtitle}>
              Enter your new password
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a new password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  intro: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: '#000',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordReset;

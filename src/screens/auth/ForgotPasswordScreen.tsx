/**
 * Forgot Password Screen
 *
 * Password reset flow:
 * 1. Enter email
 * 2. Submit and receive verification code
 * 3. Enter reset code and new password
 * 4. Reset password successfully
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../../components/common/ScreenBackground';

import type { AuthScreenProps } from '../../navigation/types';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

type ResetStep = 'email' | 'code' | 'reset';

const ForgotPasswordScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<ResetStep>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Email
  const [email, setEmail] = useState('');

  // Step 2: Verification Code
  const [verificationCode, setVerificationCode] = useState('');

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = async () => {
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call backend to send reset code to email
      // await authService.sendPasswordResetCode({ email });
      console.log('Reset code sent to:', email);
      setStep('code');
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send reset code'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    setError(null);

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length < 6) {
      setError('Verification code must be at least 6 characters');
      return;
    }

    setStep('reset');
  };

  const handlePasswordReset = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // TODO: Call backend to reset password
      // await authService.resetPassword({ email, code: verificationCode, newPassword });
      console.log('Password reset successful');
      Alert.alert(
        'Success',
        'Your password has been reset. Please login with your new password.',
        [
          {
            text: 'Login',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    if (step === 'email') {
      navigation.goBack();
    } else {
      setStep(step === 'code' ? 'email' : 'code');
      setError(null);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header with Back Button */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={handleBackPress}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={{ width: 28 }} />
          </View>

        <View style={styles.content}>
          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              <View style={styles.intro}>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a code to reset
                  your password
                </Text>
              </View>

              <View style={styles.form}>
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
                  style={[
                    styles.submitButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleEmailSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </View>
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

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    editable={!loading}
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleCodeSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Verify Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 'reset' && (
            <>
              <View style={styles.intro}>
                <Text style={styles.subtitle}>Enter your new password</Text>
              </View>

              <View style={styles.form}>
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
                  style={[
                    styles.submitButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handlePasswordReset}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
   </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    maxWidth: 353,
    alignSelf: 'center',
    width: '100%',
  },
  intro: {
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '400', fontFamily: 'Poppins',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.primary,
    backgroundColor: colors.brand.inputBg,
    height: 42,
  },
  errorContainer: {
    backgroundColor: colors.brand.inputErrorBg,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderInputError,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: colors.brand.buttonPrimary,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: spacing.lg,
    height: 42,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});

export default ForgotPasswordScreen;

/**
 * Forgot Password Screen
 *
 * Password reset flow:
 * 1. Enter email
 * 2. Submit and receive verification code
 * 3. Enter reset code and new password
 * 4. Reset password successfully
 *
 * NOTE: this flow does not call the backend yet (see handleEmailSubmit /
 * handlePasswordReset below) — that is a known, pre-existing functional gap
 * tracked separately and intentionally left untouched here.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../../components/common/ScreenBackground';
import { FigmaPrimaryButton } from '../../components/ui/FigmaPrimaryButton';
import OTPInput from '../../components/auth/OTPInput';
import { tokens } from '../../theme/tokens';

import type { AuthScreenProps } from '../../navigation/types';

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <ScreenBackground style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.topSection}>
              {/* Back control */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>

              {/* Logo + Title */}
              <View style={styles.header}>
                <Image
                  source={require('../../assets/images/talktivity-logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>Reset Your Password</Text>
              </View>

              {/* Step 1: Email */}
              {step === 'email' && (
                <>
                  <Text style={styles.subtitle}>
                    Enter your email address and we&apos;ll send you a code to
                    reset your password
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                      Email Address <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputWrapper, error && styles.inputError]}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color="#9a9a9a"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={tokens.color.text.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <FigmaPrimaryButton
                    onPress={handleEmailSubmit}
                    disabled={loading}
                    loading={loading}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Send Verification Code</Text>
                  </FigmaPrimaryButton>
                </>
              )}

              {/* Step 2: Verification Code */}
              {step === 'code' && (
                <>
                  <Text style={styles.subtitle}>
                    Enter the verification code we sent to {email}
                  </Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification Code</Text>
                    <OTPInput
                      value={verificationCode}
                      onChange={setVerificationCode}
                      disabled={loading}
                      autoFocus
                      error={!!error}
                    />
                  </View>

                  {error && (
                    <Text style={[styles.errorText, styles.errorTextCenter]}>{error}</Text>
                  )}

                  <FigmaPrimaryButton
                    onPress={handleCodeSubmit}
                    disabled={loading}
                    loading={loading}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Verify Code</Text>
                  </FigmaPrimaryButton>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 'reset' && (
                <>
                  <Text style={styles.subtitle}>Enter your new password</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#9a9a9a"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Create a new password"
                        placeholderTextColor={tokens.color.text.placeholder}
                        secureTextEntry={!showNewPassword}
                        editable={!loading}
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowNewPassword((v) => !v)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#9a9a9a"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color="#9a9a9a"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm your password"
                        placeholderTextColor={tokens.color.text.placeholder}
                        secureTextEntry={!showConfirmPassword}
                        editable={!loading}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword((v) => !v)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color="#9a9a9a"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {error && <Text style={styles.errorText}>{error}</Text>}

                  <FigmaPrimaryButton
                    onPress={handlePasswordReset}
                    disabled={loading}
                    loading={loading}
                    style={styles.submitButton}
                  >
                    <Text style={styles.submitButtonText}>Reset Password</Text>
                  </FigmaPrimaryButton>
                </>
              )}
            </View>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SafeAreaView style={styles.safeArea} edges={['bottom']} />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 20,
    maxWidth: 353,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  topSection: {
    width: '100%',
  },
  // Back control — canonical recipe: 42px square, radius 6, surface.card
  // background, border.card border, chevron icon.
  backButton: {
    width: 42,
    height: 42,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  // Header (logo + title)
  header: {
    alignItems: 'center',
    gap: 18,
    marginBottom: 48,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 33.6,
    letterSpacing: 0.14,
    color: tokens.color.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: tokens.color.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Input
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 22.4,
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: tokens.color.text.placeholder,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.input,
    backgroundColor: tokens.color.surface.card,
    paddingLeft: 12,
  },
  inputError: {
    borderColor: tokens.color.state.danger,
    backgroundColor: 'rgba(255,35,35,0.10)',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    paddingRight: 12,
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: '#ffffff',
  },
  passwordToggle: {
    paddingRight: 12,
    paddingLeft: 4,
  },
  errorText: {
    color: tokens.color.state.errorText,
    fontSize: 13,
    fontFamily: 'Poppins',
    lineHeight: 18,
    marginBottom: 20,
  },
  errorTextCenter: {
    textAlign: 'center',
  },
  submitButton: {
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    width: '100%',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: 19.6,
    color: '#ffffff',
  },
  // Back to Login
  backToLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: tokens.color.text.secondary,
  },
});

export default ForgotPasswordScreen;

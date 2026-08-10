/**
 * Change Password Screen
 *
 * Single-page password change flow for authenticated users with locked inputs:
 * 1. Email (pre-filled and locked)
 * 2. Verification code → locked when verified
 * 3. Set new password
 * 4. Success state
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { authService } from '@/services/auth';
import OTPInput from '@/components/auth/OTPInput';
import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';

type Step = 'verify' | 'code' | 'password' | 'success';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('verify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Lock states
  const [codeLocked, setCodeLocked] = useState(false);

  // Focus states for input borders
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Get user email on mount
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const user = await authService.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch (err) {
        // Silently fail
      }
    };
    loadUserEmail();
  }, []);

  // Step 1: Send code to email
  const handleSendCode = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setStep('code');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Failed to send verification code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code
  const handleVerifyCode = async () => {
    setError(null);

    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyResetCode(email, verificationCode);
      setCodeLocked(true);
      setStep('password');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Invalid verification code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handlePasswordReset = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, verificationCode, newPassword);
      setStep('success');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Failed to change password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setVerificationCode('');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Failed to resend code';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get button config based on step
  const getButtonConfig = () => {
    switch (step) {
      case 'verify':
        return { text: 'Send Verification Code', onPress: handleSendCode };
      case 'code':
        return { text: 'Verify Code', onPress: handleVerifyCode };
      case 'password':
        return { text: 'Change Password', onPress: handlePasswordReset };
      case 'success':
        return { text: 'Back to Profile', onPress: () => navigation.goBack() };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color="rgba(255,255,255,0.8)"
          />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {step === 'success' ? (
              /* Success State */
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark-circle"
                    size={64}
                    color={colors.success}
                  />
                </View>
                <Text style={styles.successTitle}>Password Changed</Text>
                <Text style={styles.successSubtitle}>
                  Your password has been changed successfully.
                </Text>
              </View>
            ) : (
              /* Single-Page Form */
              <View style={styles.form}>
                <Text style={styles.intro}>
                  To change your password, we'll send a verification code to
                  your email.
                </Text>

                {/* Step 1: Email Display (locked) */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepHeader}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>1</Text>
                    </View>
                    <Text style={styles.stepLabel}>Your Email</Text>
                  </View>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.text.secondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.inputLocked]}
                      value={email}
                      editable={false}
                    />
                  </View>
                </View>

                {/* Step 2: Verification Code */}
                {(step === 'code' || step === 'password') && (
                  <View style={styles.stepContainer}>
                    <View style={styles.stepHeader}>
                      <View
                        style={[
                          styles.stepBadge,
                          codeLocked && styles.stepBadgeComplete,
                        ]}
                      >
                        {codeLocked ? (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.text.primary}
                          />
                        ) : (
                          <Text style={styles.stepBadgeText}>2</Text>
                        )}
                      </View>
                      <Text style={styles.stepLabel}>Verification Code</Text>
                      {!codeLocked && (
                        <TouchableOpacity
                          onPress={handleResendCode}
                          disabled={loading}
                        >
                          <Text style={styles.resendText}>Resend</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.codeSentText}>
                      Enter the 6-digit code sent to your email
                    </Text>
                    <View style={codeLocked ? styles.otpLocked : undefined}>
                      <OTPInput
                        value={verificationCode}
                        onChange={setVerificationCode}
                        disabled={codeLocked || loading}
                        autoFocus={step === 'code'}
                        error={!!error && step === 'code'}
                      />
                    </View>
                    {codeLocked && (
                      <View style={styles.lockedNotice}>
                        <Ionicons
                          name="lock-closed"
                          size={14}
                          color={colors.success}
                        />
                        <Text style={styles.lockedNoticeText}>
                          Code verified
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Step 3: New Password */}
                {step === 'password' && (
                  <View style={styles.stepContainer}>
                    <View style={styles.stepHeader}>
                      <View style={styles.stepBadge}>
                        <Text style={styles.stepBadgeText}>3</Text>
                      </View>
                      <Text style={styles.stepLabel}>Create New Password</Text>
                    </View>

                    <View style={styles.passwordFields}>
                      <View
                        style={[
                          styles.inputWrapper,
                          newPasswordFocused && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="key-outline"
                          size={20}
                          color={
                            newPasswordFocused
                              ? colors.primary
                              : colors.text.tertiary
                          }
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="New password"
                          placeholderTextColor={colors.text.secondary}
                          secureTextEntry
                          editable={!loading}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          onFocus={() => setNewPasswordFocused(true)}
                          onBlur={() => setNewPasswordFocused(false)}
                        />
                      </View>

                      <View
                        style={[
                          styles.inputWrapper,
                          confirmPasswordFocused && styles.inputWrapperFocused,
                        ]}
                      >
                        <Ionicons
                          name="shield-outline"
                          size={20}
                          color={
                            confirmPasswordFocused
                              ? colors.primary
                              : colors.text.tertiary
                          }
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Confirm password"
                          placeholderTextColor={colors.text.secondary}
                          secureTextEntry
                          editable={!loading}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          onFocus={() => setConfirmPasswordFocused(true)}
                          onBlur={() => setConfirmPasswordFocused(false)}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Error Display */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          style={[
            styles.bottomButton,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <FigmaPrimaryButton
            onPress={buttonConfig.onPress}
            disabled={loading}
            loading={loading}
            style={{ height: 50, borderRadius: 10, width: '100%' }}
          >
            {loading ? null : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
                {buttonConfig.text}
              </Text>
            )}
            {loading && <ActivityIndicator size="small" color="#fff" />}
          </FigmaPrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Space for fixed button
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  intro: {
    fontSize: 15,
    color: colors.text.muted,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  form: {
    flex: 1,
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 8,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeComplete: {
    backgroundColor: colors.success,
  },
  stepBadgeText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  resendText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  codeSentText: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 0.5,
  },
  inputIcon: {
    marginLeft: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputLocked: {
    color: colors.text.tertiary,
  },
  otpLocked: {
    opacity: 0.5,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  lockedNoticeText: {
    fontSize: 13,
    color: colors.success,
  },
  passwordFields: {
    gap: spacing.sm,
  },
  errorContainer: {
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});

export default ChangePasswordScreen;

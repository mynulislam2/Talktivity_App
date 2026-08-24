/**
 * EmailVerificationBadge Component (React Native)
 *
 * Shows email verification status with a verify button for unverified emails.
 * Opens a modal for the verification flow.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { authService } from '@/services/auth';
import OTPInput from '@/components/auth/OTPInput';

export interface EmailVerificationBadgeProps {
  email: string;
  isVerified: boolean;
  onVerified?: () => void;
}

type Step = 'idle' | 'sending' | 'code' | 'verifying' | 'success';

export function EmailVerificationBadge({
  email,
  isVerified,
  onVerified,
}: EmailVerificationBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleOpenModal = async () => {
    setShowModal(true);
    setStep('sending');
    setError('');
    setVerificationCode('');

    try {
      await authService.sendEmailVerificationCode();
      setStep('code');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Failed to send verification code';
      setError(errorMessage);
      setStep('idle');
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setStep('verifying');
    setError('');

    try {
      await authService.verifyEmail(verificationCode);
      setStep('success');

      // Notify parent component after a delay
      if (onVerified) {
        setTimeout(() => {
          onVerified();
          setShowModal(false);
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Invalid verification code';
      setError(errorMessage);
      setStep('code');
    }
  };

  const handleResendCode = async () => {
    setStep('sending');
    setError('');
    setVerificationCode('');

    try {
      await authService.sendEmailVerificationCode();
      setStep('code');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response
              ?.data?.error || 'Failed to resend code';
      setError(errorMessage);
      setStep('code');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep('idle');
    setVerificationCode('');
    setError('');
  };

  if (isVerified) {
    return (
      <View style={styles.verifiedBadge}>
        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>
    );
  }

  return (
    <>
      {/* Not Verified Badge with Verify Button */}
      <View style={styles.container}>
        <View style={styles.notVerifiedBadge}>
          <Ionicons name="alert-circle" size={14} color={colors.warning} />
          <Text style={styles.notVerifiedText}>Not Verified</Text>
        </View>
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleOpenModal}
          activeOpacity={0.7}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Verification Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          // Only allow closing via back button if not in code entry step
          if (step !== 'code' && step !== 'verifying') {
            handleCloseModal();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoiding}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <LinearGradient
                  colors={['#050110', '#120a30', '#050110']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalContent}
                >
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Verify Your Email</Text>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Ionicons
                        name="close"
                        size={24}
                        color={colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Content */}
                  {step === 'sending' && (
                    <View style={styles.loadingState}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.loadingText}>
                        Sending verification code...
                      </Text>
                    </View>
                  )}

                  {(step === 'code' || step === 'verifying') && (
                    <View style={styles.codeState}>
                      <Text style={styles.codeInstructions}>
                        Enter the 6-digit code sent to{'\n'}
                        <Text style={styles.emailHighlight}>{email}</Text>
                      </Text>

                      <OTPInput
                        value={verificationCode}
                        onChange={setVerificationCode}
                        disabled={step === 'verifying'}
                        autoFocus
                        error={!!error}
                      />

                      {error ? (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>{error}</Text>
                        </View>
                      ) : null}

                      <TouchableOpacity
                        onPress={handleVerifyCode}
                        disabled={
                          step === 'verifying' || verificationCode.length !== 6
                        }
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#9333ea', '#3b82f6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[
                            styles.submitButton,
                            (step === 'verifying' ||
                              verificationCode.length !== 6) &&
                              styles.disabledButton,
                          ]}
                        >
                          {step === 'verifying' ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.submitButtonText}>
                              Verify Email
                            </Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.resendButton}
                        onPress={handleResendCode}
                        disabled={step === 'verifying'}
                      >
                        <Text style={styles.resendButtonText}>Resend Code</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {step === 'success' && (
                    <View style={styles.successState}>
                      <View style={styles.successIcon}>
                        <Ionicons
                          name="checkmark-circle"
                          size={64}
                          color={colors.success}
                        />
                      </View>
                      <Text style={styles.successTitle}>Email Verified!</Text>
                      <Text style={styles.successSubtitle}>
                        Your email has been successfully verified.
                      </Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableWithoutFeedback>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.success,
  },
  notVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notVerifiedText: {
    fontSize: 12,
    color: colors.warning,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  verifyButtonText: {
    fontSize: 11,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.black + '99',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoiding: {
    width: '100%',
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.text.tertiary,
  },
  codeState: {
    gap: spacing.lg,
  },
  codeInstructions: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.text.primary,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
  },
  errorContainer: {
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
    borderRadius: 8,
    padding: spacing.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default EmailVerificationBadge;

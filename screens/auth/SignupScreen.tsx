/**
 * Signup Screen
 * 
 * User registration screen - create new account
 * Matches Next.js implementation exactly with proper hooks and validation
 */

import React, { useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  registerUser,
  selectRegisterLoading,
  selectRegisterError,
  clearError,
} from '@/store/slices/authSlice';
import { useAuthForm } from '@/hooks/auth/useAuthForm';
import { useAuthErrorDisplay } from '@/hooks/auth/useAuthErrorDisplay';
import { useAuthSubmitNative as useAuthSubmit } from '@/hooks/auth/useAuthSubmitNative';
import { useAuthGoogleLoginNative } from '@/hooks/auth/useAuthGoogleLoginNative';
import { signupSchema, SignupFormData } from '@/lib/validation/authSchemas';
import { RegisterRequest } from '@/types/auth';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DividerWithText } from '@/components/auth/DividerWithText';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { SignupScreenProps } from '@/navigation/types';

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const isLoading = useAppSelector(selectRegisterLoading);
  const error = useAppSelector(selectRegisterError);

  // Form management
  const form = useAuthForm<SignupFormData>(
    { email: '', password: '', fullName: '', confirmPassword: '', termsAgreed: 'false' },
    signupSchema
  );

  // Google Auth
  const { googleLogin, isLoading: googleLoading, error: googleError } = useAuthGoogleLoginNative({
    form: {
      setError: (field: string, message: string) => {
        form.setError(field as keyof SignupFormData, message);
      },
    },
    onError: (errorMessage) => {
      form.setError('email', errorMessage);
    },
  });

  // Error display
  const { displayError, clearError: clearDisplayError } = useAuthErrorDisplay({
    reduxError: error,
    googleError: googleError,
    formErrors: form.errors,
  });

  // Form submission - use React Native version
  const { handleSubmit } = useAuthSubmit({
    action: registerUser,
    form: {
      setError: (field: string, message: string) => {
        form.setError(field as keyof SignupFormData, message);
      },
    },
    onError: (errorMessage) => {
      form.setError('email', errorMessage);
    },
  });

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleErrorDismiss = () => {
    clearDisplayError();
    form.setErrors({});
  };

  const handleFormSubmit = async () => {
    await form.handleSubmit(async (data) => {
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      };
      await handleSubmit(registerData);
    });
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleTermsPress = () => {
    // Navigate to terms screen or open link
    Linking.openURL('https://talktivity.com/terms').catch(() => {});
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy screen or open link
    Linking.openURL('https://talktivity.com/privacy').catch(() => {});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your language learning journey</Text>
          </View>

          {/* Error Display */}
          {displayError && (
            <View style={styles.errorContainer}>
              <View style={styles.errorContent}>
                <Text style={styles.errorText}>{displayError}</Text>
                <TouchableOpacity onPress={handleErrorDismiss} style={styles.errorDismiss}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, form.errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                editable={!isLoading && !form.isSubmitting}
                value={form.formState.fullName}
                onChangeText={(value) => form.handleChange('fullName', value)}
              />
              {form.errors.fullName && (
                <Text style={styles.fieldError}>{form.errors.fullName}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, form.errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading && !form.isSubmitting}
                value={form.formState.email}
                onChangeText={(value) => form.handleChange('email', value)}
              />
              {form.errors.email && (
                <Text style={styles.fieldError}>{form.errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, form.errors.password && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!isLoading && !form.isSubmitting}
                value={form.formState.password}
                onChangeText={(value) => form.handleChange('password', value)}
              />
              {form.errors.password && (
                <Text style={styles.fieldError}>{form.errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, form.errors.confirmPassword && styles.inputError]}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!isLoading && !form.isSubmitting}
                value={form.formState.confirmPassword}
                onChangeText={(value) => form.handleChange('confirmPassword', value)}
              />
              {form.errors.confirmPassword && (
                <Text style={styles.fieldError}>{form.errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms Checkbox */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => {
                  form.handleChange('termsAgreed', form.formState.termsAgreed === 'true' ? 'false' : 'true');
                }}
                disabled={isLoading || form.isSubmitting}
              >
                <View style={[styles.checkbox, form.formState.termsAgreed === 'true' && styles.checkboxChecked]}>
                  {form.formState.termsAgreed === 'true' && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink} onPress={handleTermsPress}>
                    Terms and Conditions
                  </Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink} onPress={handlePrivacyPress}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
              {form.errors.termsAgreed && (
                <Text style={styles.fieldError}>{form.errors.termsAgreed}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (isLoading || form.isSubmitting || form.formState.termsAgreed !== 'true') && styles.submitButtonDisabled,
              ]}
              onPress={handleFormSubmit}
              disabled={isLoading || form.isSubmitting || form.formState.termsAgreed !== 'true'}
            >
              {isLoading || form.isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <DividerWithText />

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onPress={() => googleLogin()}
            disabled={isLoading || googleLoading || form.isSubmitting}
            isLoading={googleLoading}
          />

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLoginPress}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161823',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    marginLeft: spacing.sm,
  },
  form: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginBottom: spacing.sm,
  },
  required: {
    color: '#f00',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1E2029',
  },
  inputError: {
    borderColor: '#f00',
  },
  fieldError: {
    color: '#f00',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  termsContainer: {
    marginBottom: spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: spacing.sm,
    marginTop: 2,
    backgroundColor: '#1E2029',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6A5AE0',
    borderColor: '#6A5AE0',
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: '#6A5AE0',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  footerLink: {
    fontSize: 14,
    color: '#6A5AE0',
    fontWeight: '600',
  },
});

export default SignupScreen;

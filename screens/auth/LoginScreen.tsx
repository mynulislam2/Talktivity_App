/**
 * Login Screen
 * 
 * User authentication screen - enter email and password
 * Matches Next.js implementation exactly with proper hooks and validation
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
  Modal,
  Alert,
  TouchableHighlight,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  selectLoginLoading,
  selectLoginError,
  clearError,
} from '@/store/slices/authSlice';
import { useAuthForm } from '@/hooks/auth/useAuthForm';
import { useAuthErrorDisplay } from '@/hooks/auth/useAuthErrorDisplay';
import { useAuthSubmitNative as useAuthSubmit } from '@/hooks/auth/useAuthSubmitNative';
import { useAuthGoogleLoginNative } from '@/hooks/auth/useAuthGoogleLoginNative';
import { loginSchema } from '@/lib/validation/authSchemas';
import { LoginRequest } from '@/types/auth';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { DividerWithText } from '@/components/auth/DividerWithText';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import type { LoginScreenProps } from '@/navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectLifecycleData, selectLifecycleLoading } from '@/store/slices/lifecycleSlice';
import { getRedirectPath } from '@/lib/routing/getRedirectPath';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [showUserNotFoundPopup, setShowUserNotFoundPopup] = useState(false);

  // Redux selectors
  const isLoading = useAppSelector(selectLoginLoading);
  const error = useAppSelector(selectLoginError);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const lifecycle = useAppSelector(selectLifecycleData);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);

  // Form management
  const form = useAuthForm<LoginRequest>(
    { email: '', password: '' },
    loginSchema
  );

  // Google Auth
  const { googleLogin, isLoading: googleLoading, error: googleError } = useAuthGoogleLoginNative({
    form: {
      setError: (field: string, message: string) => {
        form.setError(field as keyof LoginRequest, message);
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

  // Form submission
  const { handleSubmit } = useAuthSubmit({
    action: loginUser,
    onError: (errorMessage) => {
      // Check if it's a 401 error (user not found/invalid credentials)
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('401')) {
        setShowUserNotFoundPopup(true);
      } else {
        form.setError('email', errorMessage);
      }
    },
    form,
  });

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // If user is already authenticated and lifecycle requires onboarding/call/report/upgrade,
  // redirect away from Login into the appropriate auth flow screen.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (lifecycleLoading || !lifecycle) return;

    const redirectPath = getRedirectPath(lifecycle);
    console.log('[LoginScreen] Redirect path:', redirectPath);

    if (redirectPath === '/onboarding') {
      console.log('[LoginScreen] Navigating to Onboarding');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' as never }],
      } as any);
    } else if (redirectPath === '/call?CallStart=true' || redirectPath === '/call') {
      console.log('[LoginScreen] Navigating to CallScreen');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'CallScreen' as never,
            params: redirectPath === '/call?CallStart=true' ? { CallStart: true } : undefined,
          },
        ],
      } as any);
    } else if (redirectPath === '/upgrade') {
      console.log('[LoginScreen] Navigating to SubscriptionScreen (upgrade)');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SubscriptionScreen' as never }],
      } as any);
    }
  }, [isAuthenticated, lifecycle, lifecycleLoading, navigation]);

  // Modal handlers
  const handleCreateAccount = () => {
    setShowUserNotFoundPopup(false);
    navigation.navigate('Signup');
  };

  const handleCloseUserNotFoundPopup = () => {
    setShowUserNotFoundPopup(false);
    form.reset();
  };

  const handleTryAgain = () => {
    setShowUserNotFoundPopup(false);
    form.reset();
  };

  const handleErrorDismiss = () => {
    clearDisplayError();
    form.setErrors({});
  };

  const handleFormSubmit = async () => {
    await form.handleSubmit(handleSubmit);
  };

  const handleSignupPress = () => {
    navigation.navigate('Signup');
  };

  const handleForgotPasswordPress = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Continue your language learning journey</Text>
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

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={handleForgotPasswordPress}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableHighlight
              style={[
                styles.submitButton,
                (isLoading || form.isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleFormSubmit}
              disabled={isLoading || form.isSubmitting}
              activeOpacity={0.2}
            >
              {isLoading || form.isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableHighlight>
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
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={handleSignupPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* User Not Found Modal */}
      <Modal
        visible={showUserNotFoundPopup}
        transparent
        animationType="fade"
        onRequestClose={handleCloseUserNotFoundPopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Not Found</Text>
              <TouchableOpacity onPress={handleCloseUserNotFoundPopup}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="alert-circle" size={48} color="#f44" />
              </View>
              <Text style={styles.modalHeading}>User Not Found</Text>
              <Text style={styles.modalText}>
                The email address or password you entered is incorrect. Please try again or create a new account.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={handleCreateAccount}
                >
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.modalButtonPrimaryText}>Create New Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={handleTryAgain}
                >
                  <Text style={styles.modalButtonSecondaryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#161823',
  },
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordLink: {
    color: '#6A5AE0',
    fontSize: 14,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#333',
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    gap: spacing.md,
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#444',
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  modalButtonSecondaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

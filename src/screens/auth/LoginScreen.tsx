/**
 * Login Screen
 *
 * Matches frontend login page exactly — pixel-perfect.
 * - Logo "Logo1.png" + "Start Your Journey!"
 * - Google sign-in "Continue with Google"
 * - Divider "Or Sign in with Email"
 * - Email input with mail icon
 * - Password input with lock icon + show/hide + "Forget password?"
 * - Continue button with arrow
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenBackground from '../../components/common/ScreenBackground';
import GradientButton from '../../components/common/GradientButton';
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
import type { LoginScreenProps } from '@/navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectLifecycleLoading } from '@/store/slices/lifecycleSlice';

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [showUserNotFoundPopup, setShowUserNotFoundPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isLoading = useAppSelector(selectLoginLoading);
  const error = useAppSelector(selectLoginError);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const lifecycleLoading = useAppSelector(selectLifecycleLoading);

  const form = useAuthForm<LoginRequest>(
    { email: '', password: '' },
    loginSchema
  );

  const {
    googleLogin,
    isLoading: googleLoading,
    error: googleError,
  } = useAuthGoogleLoginNative({
    form: {
      setError: (field: string, message: string) => {
        form.setError(field as keyof LoginRequest, message);
      },
    },
    onError: (errorMessage: any) => {
      form.setError('email', errorMessage);
    },
  });

  const { displayError, clearError: clearDisplayError } = useAuthErrorDisplay({
    reduxError: error,
    googleError: googleError,
    formErrors: form.errors,
  });

  const { handleSubmit } = useAuthSubmit({
    action: loginUser,
    onError: (errorMessage: any) => {
      const normalized =
        errorMessage.toLowerCase().includes('invalid') ||
        errorMessage.toLowerCase().includes('401') ||
        errorMessage.toLowerCase().includes('not found')
          ? 'Wrong email or password'
          : errorMessage;
      form.setError('email', normalized);
      form.setError('password', normalized);
    },
    form,
  });

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && !lifecycleLoading) {
    }
  }, [isAuthenticated, lifecycleLoading, navigation]);

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

  const handleForgotPasswordPress = () => {
    navigation.navigate('ForgotPassword');
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
            {/* Logo + Title */}
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/talktivity-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Start Your Journey!</Text>
            </View>

            {/* Error Display */}
            {displayError && (
              <View style={styles.errorContainer}>
                <View style={styles.errorContent}>
                  <Text style={styles.errorText}>{displayError}</Text>
                  <TouchableOpacity
                    onPress={handleErrorDismiss}
                    style={styles.errorDismiss}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Google Sign-In */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => googleLogin()}
              disabled={isLoading || googleLoading || form.isSubmitting}
              activeOpacity={0.85}
            >
              {googleLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#FDFDFD" />
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or Sign in with Email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  form.errors.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#9a9a9a"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#8C8C8C"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading && !form.isSubmitting}
                  value={form.formState.email}
                  onChangeText={(value) => form.handleChange('email', value)}
                />
              </View>
              {form.errors.email && (
                <Text style={styles.fieldError}>{form.errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  form.errors.password && styles.inputError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9a9a9a"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#8C8C8C"
                  secureTextEntry={!showPassword}
                  editable={!isLoading && !form.isSubmitting}
                  value={form.formState.password}
                  onChangeText={(value) => form.handleChange('password', value)}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#9a9a9a"
                  />
                </TouchableOpacity>
              </View>
              {form.errors.password && (
                <Text style={styles.fieldError}>{form.errors.password}</Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPasswordPress}
              style={styles.forgotContainer}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10 }}
            >
              <Text style={styles.forgotText}>Forget password?</Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <GradientButton
              onPress={handleFormSubmit}
              disabled={isLoading || form.isSubmitting}
              loading={isLoading || form.isSubmitting}
              style={styles.continueButton}
              gradientColors={['#0e55ff', '#6a4bff', '#c55dfe'] as const}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              size="medium"
              fullWidth
            >
              <View style={styles.continueContent}>
                <Text style={styles.continueText}>Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#fff"
                  style={styles.continueArrow}
                />
              </View>
            </GradientButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SafeAreaView style={styles.safeArea} edges={['bottom']} />

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
              <Text style={styles.modalHeading}>Account Not Found</Text>
              <Text style={styles.modalText}>
                Wrong email or password. Please try again.
              </Text>
              <View style={styles.modalButtons}>
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
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05030C',
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
    marginHorizontal: 20,
    maxWidth: 353,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 92,
    paddingBottom: 24,
  },
  // Header
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 33.6,
    letterSpacing: 0.14,
    color: '#fdfdfd',
    textAlign: 'center',
  },
  // Error
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    flex: 1,
  },
  errorDismiss: {
    marginLeft: 8,
  },
  // Google Button
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#636363',
    backgroundColor: 'rgba(255,255,255,0.10)',
    gap: 8,
    marginTop: 32,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 22.4,
    color: '#FDFDFD',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 16.8,
    color: '#ffffff',
  },
  // Input
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 22.4,
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: '#8c8c8c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#636363',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingLeft: 12,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.10)',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 42,
    paddingRight: 12,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#ffffff',
  },
  passwordToggle: {
    paddingRight: 12,
    paddingLeft: 4,
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  // Forgot Password
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '400', fontFamily: 'Poppins',
    lineHeight: 19.6,
    color: '#C6C6C6',
  },
  // Continue Button
  continueButton: {
    height: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  continueButtonDisabled: {
    opacity: 0.65,
  },
  continueContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: '100%',
  },
  continueText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    lineHeight: 19.6,
    color: '#ffffff',
  },
  continueArrow: {
    marginLeft: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1E2029',
    borderRadius: 16,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: '#fdfdfd',
  },
  modalBody: {
    padding: 16,
  },
  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: 'bold', fontFamily: 'Poppins-Bold',
    color: '#fdfdfd',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalButtons: {
    gap: 12,
  },
  modalButtonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E2029',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalButtonSecondaryText: {
    color: '#fdfdfd',
    fontSize: 16,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});

export default LoginScreen;

/**
 * Onboarding Screen - 15-step comprehensive user profile setup
 * 
 * Matches the Next.js version with:
 * - 15 data-driven steps (skill, language statement, industry, etc.)
 * - Redux integration with onboardingSlice
 * - Single and multi-select steps
 * - Proper validation per step
 * - Progress tracking
 */

import React, { useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadOnboarding,
  saveOnboarding,
  selectSelections,
  selectCurrentStep,
  selectIsLoading,
  selectIsComplete,
  selectError,
  selectDataLoaded,
  setCurrentStep,
  updateSelection,
  updateTempSelections,
  clearTempSelections,
} from '../../store/slices/onboardingSlice';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { STEP_DEFINITIONS } from '../../lib/onboarding/stepDefinitions';
import { StepRouter } from '../../components/onboarding/StepRouter';

interface OnboardingScreenProps {
  navigation: any;
}

const TOTAL_STEPS = 15;

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  // Redux state
  const selections = useAppSelector(selectSelections);
  const currentStep = useAppSelector(selectCurrentStep);
  const isLoading = useAppSelector(selectIsLoading);
  const isComplete = useAppSelector(selectIsComplete);
  const error = useAppSelector(selectError);
  const dataLoaded = useAppSelector(selectDataLoaded);

  // Current step definition
  const currentStepDef = useMemo(
    () => STEP_DEFINITIONS[currentStep] || STEP_DEFINITIONS[0],
    [currentStep]
  );

  // Load onboarding data on mount
  useEffect(() => {
    if (dataLoaded) return;
    
    const initialize = async () => {
      const result = await dispatch(loadOnboarding());
      
      if (loadOnboarding.fulfilled.match(result)) {
        const lifecycleData = result.payload;
        
        // If already completed, navigate to main app
        if (lifecycleData.completed) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainNavigator' }],
          });
        }
        // Otherwise, form data is now loaded in Redux
      }
    };
    
    initialize();
  }, [dispatch, dataLoaded, navigation]);

  // Validate current step
  const validateStep = useCallback((step: number): boolean => {
    const stepDef = STEP_DEFINITIONS[step];
    if (!stepDef) return false;
    
    const value = selections[stepDef.field];
    return stepDef.validation(value);
  }, [selections]);

  // Handle single selection
  const handleSingleSelect = useCallback(
    (value: string) => {
      dispatch(updateSelection({ field: currentStepDef.field, value }));
    },
    [dispatch, currentStepDef.field]
  );

  // Handle multi-selection toggle
  const handleMultiSelect = useCallback(
    (optionId: string) => {
      const currentValue = (selections[currentStepDef.field] as string[]) || [];
      const newValue = currentValue.includes(optionId)
        ? currentValue.filter((id) => id !== optionId)
        : [...currentValue, optionId];
      
      dispatch(updateSelection({ field: currentStepDef.field, value: newValue }));
    },
    [dispatch, currentStepDef.field, selections]
  );

  // Navigate to next step
  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) {
      Alert.alert('Incomplete', 'Please complete this step to continue');
      return;
    }
    
    if (currentStep < TOTAL_STEPS - 1) {
      dispatch(setCurrentStep(currentStep + 1));
    }
  }, [currentStep, validateStep, dispatch]);

  // Navigate to previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  }, [currentStep, dispatch]);

  // Handle finish/save
  const handleFinish = useCallback(async () => {
    // Validate final step
    if (!validateStep(currentStep)) {
      Alert.alert('Incomplete', 'Please complete the final step');
      return;
    }

    try {
      // Save all selections
      const result = await dispatch(saveOnboarding());
      
      if (saveOnboarding.fulfilled.match(result)) {
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainNavigator' }],
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  }, [currentStep, validateStep, dispatch, navigation]);

  // Handle skip (with confirmation)
  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Onboarding',
      'You can update these preferences later in settings.',
      [
        { text: 'Cancel' },
        {
          text: 'Skip',
          onPress: () => {
            // Skip to main app without saving
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainNavigator' }],
            });
          },
          style: 'destructive',
        },
      ]
    );
  }, [navigation]);

  // Loading state
  if (isLoading && !dataLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error || '#ef4444'} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(loadOnboarding())}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progressPercentage = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%` },
          ]}
        />
      </View>

      {/* Step Counter */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepText}>
          Step {currentStep + 1} of {TOTAL_STEPS}
        </Text>
      </View>

      {/* Title and Subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{currentStepDef.title}</Text>
        {currentStepDef.subtitle && (
          <Text style={styles.subtitle}>{currentStepDef.subtitle}</Text>
        )}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StepRouter
          step={currentStepDef}
          selections={selections}
          onSingleSelect={handleSingleSelect}
          onMultiSelect={handleMultiSelect}
        />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevious}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            currentStep === 0 ? { flex: 1 } : {},
          ]}
          onPress={currentStep === TOTAL_STEPS - 1 ? handleFinish : handleNext}
        >
          <Text style={styles.primaryButtonText}>
            {currentStep === TOTAL_STEPS - 1 ? 'Complete' : 'Next'}
          </Text>
          {currentStep < TOTAL_STEPS - 1 && (
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Skip Option (not on last step) */}
      {currentStep < TOTAL_STEPS - 1 && (
        <View style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.error || '#ef4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    flex: 0.5,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  skipText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;

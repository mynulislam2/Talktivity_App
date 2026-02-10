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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
} from '@/store/slices/onboardingSlice';

import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';
import { STEP_DEFINITIONS } from '@/lib/onboarding/stepDefinitions';
import { StepRouter } from '@/components/onboarding/StepRouter';
import { loadLifecycle, updateLifecycle } from '@/store/slices/lifecycleSlice';
import { CommonActions } from '@react-navigation/native';
import { selectTempSelections } from '@/store/slices/onboardingSlice';
import { hasStepSelection, getNextStep } from '@/lib/onboarding/stepHelpers';
import type { OnboardingScreenProps } from '@/navigation/types';

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


  // Get tempSelections from Redux
  const tempSelections = useAppSelector(selectTempSelections);

  // Handle single selection (just updates selection, no auto-advance) - matches Next.js
  const handleSingleSelect = useCallback(
    (field: keyof typeof selections, value: any) => {
      // Update selection in Redux only
      dispatch(updateSelection({ field: field as string, value }));
    },
    [dispatch]
  );

  // Handle multi-select toggle (doesn't advance) - matches Next.js
  const handleMultiToggle = useCallback(
    (field: keyof typeof selections, value: any) => {
      const currentArray = tempSelections[field] || selections[field] || [];
      const newArray = Array.isArray(currentArray)
        ? currentArray.includes(value)
          ? currentArray.filter((i: any) => i !== value)
          : [...currentArray, value]
        : [value];
      
      dispatch(updateTempSelections({ field: field as string, value: newArray }));
    },
    [tempSelections, selections, dispatch]
  );

  // Handle Continue button - works for both single and multi-select (matches Next.js)
  const handleContinue = useCallback(() => {
    if (!currentStepDef) return;

    // For multi-select, save temp selections first
    if (currentStepDef.type === 'multi-select') {
      const tempValue = tempSelections[currentStepDef.field];
      if (tempValue !== undefined) {
        dispatch(updateSelection({ field: currentStepDef.field, value: tempValue }));
        dispatch(clearTempSelections());
      }
    }

    // Navigate to next step or complete
    const nextStep = getNextStep(currentStep, TOTAL_STEPS);
    if (nextStep === null) {
      handleComplete();
    } else {
      dispatch(setCurrentStep(nextStep));
    }
  }, [currentStep, currentStepDef, tempSelections, dispatch, handleComplete]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  }, [currentStep, dispatch]);


  // Handle completion - save all data when last step is done (matches Next.js)
  const handleComplete = useCallback(async () => {
    // Save all onboarding data to backend
    const result = await dispatch(saveOnboarding());
    
    if (saveOnboarding.fulfilled.match(result)) {
      // Update lifecycle: mark onboarding as completed
      const updateResult = await dispatch(updateLifecycle({ onboarding_completed: true }));
      
      if (updateLifecycle.rejected.match(updateResult)) {
        // Failed to update onboarding_completed
        // Continue with navigation even if update fails
      }

      // Refresh lifecycle state for consistency across the app
      await dispatch(loadLifecycle());

      // Navigate directly to Call screen inside Auth stack so user does NOT see bottom tabs
      navigation.navigate('CallScreen' as any, { CallStart: true } as any);
    }
  }, [dispatch, navigation]);

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
          tempSelections={tempSelections}
          onSingleSelect={(value: any) => handleSingleSelect(currentStepDef.field, value)}
          onMultiToggle={(value: any) => handleMultiToggle(currentStepDef.field, value)}
        />
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={goToPreviousStep}
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
          onPress={handleContinue}
          disabled={!hasStepSelection(currentStepDef, selections, tempSelections || {})}
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
    backgroundColor: '#050110', // Match Next.js bg-[#050110]
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF', // White text
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
    color: '#ef4444', // Red error text
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6A5AE0', // Blue-600 (approximation of gradient)
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Match Next.js bg-white/10
    overflow: 'hidden',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6', // Purple-500 (approximation of gradient from-purple-500 to-blue-500)
    borderRadius: 2,
  },
  stepHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)', // slate-800/50
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(148, 163, 184, 1)', // slate-400
  },
  titleContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)', // slate-300
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
    borderTopColor: 'rgba(51, 65, 85, 0.5)', // slate-800/50
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
    backgroundColor: '#6A5AE0', // Blue-600 (approximation of gradient from-blue-600 to-purple-600)
    borderWidth: 1,
    borderColor: '#5A4BC0', // blue-500
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  secondaryButton: {
    flex: 0.5,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 1)', // slate-700
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // White text
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)', // slate-300
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;

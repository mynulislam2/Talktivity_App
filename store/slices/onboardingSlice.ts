/**
 * Redux Toolkit Onboarding Slice
 * 
 * Manages global onboarding state including user selections, current step,
 * progress, loading states, and errors for onboarding flow.
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { lifecycleService } from '@/service/LifecycleService';
import { onboardingService } from '@/service/OnboardingService';
import { authService } from '@/service/AuthService';
import { calculateProgress, getCompletedStepsCount } from '@/lib/onboarding/validation';
import {
  UserSelections,
  INITIAL_USER_SELECTIONS,
} from '@/types/onboarding/selections';
import {
  LifecycleResponseData,
  OnboardingSaveResponse,
} from '@/types/onboarding/responses';
import { extractErrorMessage } from '@/lib/onboarding/errorHandler';
import { validateStepCompletion } from '@/lib/onboarding/stepDefinitions';

/**
 * Onboarding state interface
 */
interface OnboardingState {
  selections: UserSelections;
  currentStep: number;
  completedSteps: number; // From lifecycle API: onboarding.steps (0-15)
  progress: number; // Calculated percentage
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  isComplete: boolean; // From lifecycle API: onboarding.completed
  tempMultiSelections: Record<string, any>;
  dataLoaded: boolean; // Track if lifecycle API has been called
}

/**
 * Initial state
 */
const initialState: OnboardingState = {
  selections: { ...INITIAL_USER_SELECTIONS },
  currentStep: 0,
  completedSteps: 0,
  progress: 0,
  isLoading: true,
  isSaving: false,
  error: null,
  isComplete: false,
  tempMultiSelections: {},
  dataLoaded: false,
};

/**
 * Async thunk: Load onboarding data from lifecycle API
 * GET /api/lifecycle: Called on page mount to get onboarding status, steps count, and form data
 */
export const loadOnboarding = createAsyncThunk(
  'onboarding/load',
  async (_, { rejectWithValue }) => {
    try {
      const userId = authService.getUser()?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Call lifecycle API which returns:
      // - onboarding.completed (boolean)
      // - onboarding.steps (number - count of completed steps, 0-15)
      // - onboarding.data (object - all 15 field values or null)
      const response = await lifecycleService.getLifecycle();
      
      if (response.success && response.data) {
        const lifecycleData = response.data;
        const backendData = lifecycleData.onboarding?.data;
        
        // Map snake_case backend fields to camelCase frontend fields
        let selections: UserSelections = { ...INITIAL_USER_SELECTIONS };
        if (backendData) {
          selections = {
            skillToImprove: backendData.skill_to_improve || null,
            languageStatement: backendData.language_statement || null,
            industry: backendData.industry || null,
            speakingFeelings: backendData.speaking_feelings || null,
            speakingFrequency: backendData.speaking_frequency || null,
            mainGoal: backendData.main_goal || null,
            gender: backendData.gender || null,
            currentLearningMethods: Array.isArray(backendData.current_learning_methods) 
              ? backendData.current_learning_methods 
              : (backendData.current_learning_methods ? [backendData.current_learning_methods] : []),
            currentLevel: backendData.current_level || null,
            nativeLanguage: backendData.native_language || null,
            knownWords1: Array.isArray(backendData.known_words_1) 
              ? backendData.known_words_1 
              : (backendData.known_words_1 ? [backendData.known_words_1] : []),
            knownWords2: Array.isArray(backendData.known_words_2) 
              ? backendData.known_words_2 
              : (backendData.known_words_2 ? [backendData.known_words_2] : []),
            interests: Array.isArray(backendData.interests) 
              ? backendData.interests 
              : (backendData.interests ? [backendData.interests] : []),
            englishStyle: backendData.english_style || null,
            tutorStyle: Array.isArray(backendData.tutor_style) 
              ? backendData.tutor_style 
              : (backendData.tutor_style ? [backendData.tutor_style] : []),
            userName: 'user', // Not stored in backend
          };
        }
        
        return {
          // Extract onboarding data
          completed: lifecycleData.onboarding?.completed || false,
          steps: lifecycleData.onboarding?.steps || 0,
          selections,
          // Include milestones for future use
          milestones: lifecycleData.milestones,
        };
      }
      
      return rejectWithValue('Failed to load lifecycle data');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async thunk: Save onboarding data
 * POST /api/onboarding: Called on auto-save and final submission
 */
export const saveOnboarding = createAsyncThunk(
  'onboarding/save',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { onboarding: OnboardingState };
      const selections = state.onboarding.selections;
      const userId = authService.getUser()?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await onboardingService.saveOnboarding(selections, userId);
      
      if (response.success && response.data) {
        return {
          allFieldsFilled: response.data.allFieldsFilled || false,
          onboardingProgress: response.data.onboardingProgress || 0,
          onboardingCompleted: response.data.onboardingCompleted || false,
        };
      }
      
      return rejectWithValue('Failed to save onboarding data');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Onboarding slice
 */
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    /**
     * Clears all error states
     */
    clearError: (state) => {
      state.error = null;
    },
    
    /**
     * Sets current step (simple - no validation)
     */
    setCurrentStep: (state, action: PayloadAction<number>) => {
      const stepId = action.payload;
      if (stepId >= 0 && stepId < 15) {
        state.currentStep = stepId;
        state.progress = calculateProgress(state.selections);
      }
    },
    
    /**
     * Updates a single selection field
     */
    updateSelection: (
      state,
      action: PayloadAction<{ field: keyof UserSelections; value: any }>
    ) => {
      const { field, value } = action.payload;
      state.selections[field] = value;
      // Recalculate progress and completed steps
      state.progress = calculateProgress(state.selections);
      state.completedSteps = getCompletedStepsCount(state.selections);
      // Clear error on update
      state.error = null;
    },
    
    /**
     * Updates temporary multi-select selections (not saved until Continue is clicked)
     */
    updateTempSelections: (
      state,
      action: PayloadAction<{ field: string; value: any }>
    ) => {
      const { field, value } = action.payload;
      state.tempMultiSelections[field] = value;
    },
    
    /**
     * Clears temporary selections
     */
    clearTempSelections: (state) => {
      state.tempMultiSelections = {};
    },
    
    /**
     * Resets onboarding state to initial
     */
    resetOnboarding: (state) => {
      state.selections = { ...INITIAL_USER_SELECTIONS };
      state.currentStep = 0;
      state.completedSteps = 0;
      state.progress = 0;
      state.isComplete = false;
      state.tempMultiSelections = {};
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle loadOnboarding
    builder
      .addCase(loadOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadOnboarding.fulfilled, (state, action) => {
        const wasDataLoaded = state.dataLoaded; // Check before updating
        state.isLoading = false;
        state.dataLoaded = true;
        state.selections = action.payload.selections;
        state.completedSteps = action.payload.steps;
        state.isComplete = action.payload.completed;
        state.progress = calculateProgress(action.payload.selections);
        
        // Only set current step on initial load (when dataLoaded was false)
        // Don't reset step if user is actively navigating
        if (!wasDataLoaded) {
          // Set current step to first incomplete step
          if (!action.payload.completed && action.payload.steps > 0) {
            // Find first incomplete step starting from completed steps
            for (let step = action.payload.steps; step < 15; step++) {
              if (!validateStepCompletion(step, action.payload.selections)) {
                state.currentStep = step;
                break;
              }
            }
          } else if (action.payload.completed) {
            state.currentStep = 14; // Last step
          } else {
            state.currentStep = 0; // Start from beginning
          }
        }
        // If dataLoaded was already true, keep the current step (user is navigating)
      })
      .addCase(loadOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to load onboarding data';
      });
    
    // Handle saveOnboarding
    builder
      .addCase(saveOnboarding.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveOnboarding.fulfilled, (state, action) => {
        state.isSaving = false;
        state.isComplete = action.payload.onboardingCompleted || false;
        state.progress = action.payload.onboardingProgress || state.progress;
        // Update completed steps count
        state.completedSteps = getCompletedStepsCount(state.selections);
      })
      .addCase(saveOnboarding.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string || 'Failed to save onboarding data';
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentStep,
  updateSelection,
  updateTempSelections,
  clearTempSelections,
  resetOnboarding,
} = onboardingSlice.actions;

// Export selectors
export const selectSelections = (state: { onboarding: OnboardingState }) => state.onboarding.selections;
export const selectCurrentStep = (state: { onboarding: OnboardingState }) => state.onboarding.currentStep;
export const selectCompletedSteps = (state: { onboarding: OnboardingState }) => state.onboarding.completedSteps;
export const selectProgress = (state: { onboarding: OnboardingState }) => state.onboarding.progress;
export const selectIsLoading = (state: { onboarding: OnboardingState }) => state.onboarding.isLoading;
export const selectIsSaving = (state: { onboarding: OnboardingState }) => state.onboarding.isSaving;
export const selectError = (state: { onboarding: OnboardingState }) => state.onboarding.error;
export const selectIsComplete = (state: { onboarding: OnboardingState }) => state.onboarding.isComplete;
export const selectTempSelections = (state: { onboarding: OnboardingState }) => state.onboarding.tempMultiSelections;
export const selectDataLoaded = (state: { onboarding: OnboardingState }) => state.onboarding.dataLoaded;

// Export reducer
export default onboardingSlice.reducer;

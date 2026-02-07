/**
 * Onboarding Service
 * 
 * Handles all onboarding-related operations including saving onboarding data.
 * 
 * This service acts as the data access layer for onboarding, managing API calls only.
 * Validation and progress calculation are handled by lib/onboarding/validation.
 * State management is handled by Redux.
 */

import { httpService } from '../httpservice';
import {
  UserSelections,
  INITIAL_USER_SELECTIONS,
} from '@/types/onboarding/selections';
import {
  OnboardingSaveResponse,
  OnboardingSaveResponseData,
} from '@/types/onboarding/responses';
import {
  OnboardingError,
  OnboardingSaveError,
  OnboardingValidationError,
} from '@/types/onboarding/errors';
import { validateSelections, calculateProgress } from '@/lib/onboarding/validation';

class OnboardingService {
  /**
   * Save or update onboarding data
   * 
   * Calls POST /api/onboarding to save the 15 onboarding fields.
   * The backend will automatically update user_lifecycle.onboarding_completed
   * if all fields are filled.
   * 
   * @param data - UserSelections object with all 15 fields
   * @param userId - User ID (optional, can be extracted from auth context)
   * @returns Promise resolving to save response with progress and completion status
   * @throws {OnboardingSaveError} If the API call fails
   * @throws {OnboardingValidationError} If validation fails
   */
  async saveOnboarding(
    data: UserSelections,
    userId?: string
  ): Promise<OnboardingSaveResponse> {
    try {
      // Validate before sending (using lib validation)
      const validationResult = validateSelections(data);
      if (!validationResult.isValid) {
        throw new OnboardingValidationError(
          validationResult.errors[0] || 'Invalid onboarding data',
          validationResult.field
        );
      }

      // Map camelCase frontend fields to snake_case backend fields
      const payload: Record<string, any> = {
        skill_to_improve: data.skillToImprove,
        language_statement: data.languageStatement,
        industry: data.industry,
        speaking_feelings: data.speakingFeelings,
        speaking_frequency: data.speakingFrequency,
        main_goal: data.mainGoal,
        gender: data.gender,
        current_learning_methods: data.currentLearningMethods,
        current_level: data.currentLevel,
        native_language: data.nativeLanguage,
        known_words_1: data.knownWords1,
        known_words_2: data.knownWords2,
        interests: data.interests,
        english_style: data.englishStyle,
        tutor_style: data.tutorStyle,
      };

      if (userId) {
        payload.user_id = userId;
      }

      const response = await httpService.post(
        '/onboarding',
        payload
      );

      // Backend returns { success: true, data: { ... }, message: "..." }
      if (response.data && response.data.success && response.data.data) {
        // Calculate progress and completion from the saved data
        const savedData = response.data.data;
        const allFieldsFilled = validateSelections(savedData).isValid;
        
        return {
          success: true,
          data: {
            allFieldsFilled,
            onboardingProgress: allFieldsFilled ? 100 : calculateProgress(savedData),
            onboardingCompleted: allFieldsFilled,
          },
        };
      }

      // Fallback: if response structure is different (direct data)
      if (response.data && typeof response.data === 'object' && !response.data.success) {
        const savedData = response.data;
        const allFieldsFilled = validateSelections(savedData).isValid;
        
        return {
          success: true,
          data: {
            allFieldsFilled,
            onboardingProgress: allFieldsFilled ? 100 : calculateProgress(savedData),
            onboardingCompleted: allFieldsFilled,
          },
        };
      }

      throw new OnboardingSaveError('Invalid response format from onboarding API');
    } catch (error) {
      if (error instanceof OnboardingError) {
        throw error;
      }

      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to save onboarding data';
      
      throw new OnboardingSaveError(errorMessage);
    }
  }


  /**
   * Get initial empty selections
   * 
   * @returns Initial UserSelections object with all fields null/empty
   */
  getInitialSelections(): UserSelections {
    return { ...INITIAL_USER_SELECTIONS };
  }
}

export const onboardingService = new OnboardingService();

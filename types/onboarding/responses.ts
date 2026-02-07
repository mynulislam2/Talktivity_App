import { UserSelections } from './selections';

/**
 * Response data from lifecycle API
 */
export interface LifecycleOnboardingData {
  completed: boolean;
  steps: number; // Count of completed steps (0-15)
  data: UserSelections | null; // All 15 field values or null if none
}

/**
 * Milestones from lifecycle API
 */
export interface LifecycleMilestones {
  callCompleted: boolean;
  reportCompleted: boolean;
  upgradeCompleted: boolean;
}

/**
 * Timestamps from lifecycle API
 */
export interface LifecycleTimestamps {
  lastProgressCheck: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Complete lifecycle response data
 */
export interface LifecycleResponseData {
  userId: string;
  onboarding: LifecycleOnboardingData;
  milestones: LifecycleMilestones;
  timestamps: LifecycleTimestamps;
}

/**
 * Lifecycle API response
 */
export interface LifecycleResponse {
  success: boolean;
  data: LifecycleResponseData;
  message?: string;
}

/**
 * Onboarding save response data
 */
export interface OnboardingSaveResponseData {
  allFieldsFilled: boolean;
  onboardingProgress: number;
  onboardingCompleted?: boolean;
}

/**
 * Onboarding save API response
 */
export interface OnboardingSaveResponse {
  success: boolean;
  data: OnboardingSaveResponseData;
  message?: string;
}

/**
 * Generic onboarding response (for backward compatibility)
 */
export interface OnboardingResponse {
  success: boolean;
  data: {
    selections: UserSelections;
    progress: number;
    allFieldsFilled: boolean;
    onboardingCompleted: boolean;
  };
  message?: string;
}

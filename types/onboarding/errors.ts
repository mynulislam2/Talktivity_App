/**
 * Base error class for onboarding-related errors
 */
export class OnboardingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'OnboardingError';
    Object.setPrototypeOf(this, OnboardingError.prototype);
  }
}

/**
 * Validation error for onboarding form fields
 */
export class OnboardingValidationError extends OnboardingError {
  constructor(
    message: string,
    public field?: keyof import('./selections').UserSelections
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'OnboardingValidationError';
  }
}

/**
 * Error when onboarding data cannot be loaded
 */
export class OnboardingLoadError extends OnboardingError {
  constructor(message: string = 'Failed to load onboarding data') {
    super(message, 'LOAD_ERROR', 500);
    this.name = 'OnboardingLoadError';
  }
}

/**
 * Error when onboarding data cannot be saved
 */
export class OnboardingSaveError extends OnboardingError {
  constructor(message: string = 'Failed to save onboarding data') {
    super(message, 'SAVE_ERROR', 500);
    this.name = 'OnboardingSaveError';
  }
}

/**
 * Error when step navigation is invalid
 */
export class StepNavigationError extends OnboardingError {
  constructor(
    message: string = 'Invalid step navigation',
    public stepId?: number
  ) {
    super(message, 'NAVIGATION_ERROR', 400);
    this.name = 'StepNavigationError';
  }
}

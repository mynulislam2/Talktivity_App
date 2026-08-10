export interface OnboardingProgress {
  completed: boolean;
  completedAt?: string;
}

export interface CallProgress {
  completed: boolean; // True after first session (even 1 second) - for routing only
  completedAt?: string; // Timestamp when first session completed
  // Note: Time exhaustion is NOT part of progress state - use useTimeLimits hook
}

export interface ReportProgress {
  completed: boolean; // True only when ALL report cards viewed AND "Complete Report" button clicked on last card
  completedAt?: string; // Timestamp when final "Complete Report" button was clicked
  // Note: Individual card viewing does NOT mark report as completed
}

export interface SubscriptionProgress {
  active: boolean;
  isFreeTrial: boolean;
  trialEndsAt?: string;
}

export interface ConversationProgress {
  hasExperience: boolean; // Legacy - use call.completed instead
  totalSessions: number;
  totalDuration: number;
}

export interface UserProgress {
  onboarding: OnboardingProgress;
  call: CallProgress;
  report: ReportProgress;
  subscription: SubscriptionProgress;
  conversation?: ConversationProgress;
}

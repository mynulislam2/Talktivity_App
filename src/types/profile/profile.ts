/**
 * Profile Types
 */

export interface ProfileData {
  id: number;
  email: string;
  full_name: string;
  profile_picture?: string;
  startingLevel?: string;
  created_at?: string;
  lifecycle?: {
    onboardingCompleted: boolean;
    callCompleted: boolean;
    reportCompleted: boolean;
    upgradeCompleted: boolean;
  };
}

export interface ProfileResponse {
  success: boolean;
  data?: ProfileData;
  error?: string;
}

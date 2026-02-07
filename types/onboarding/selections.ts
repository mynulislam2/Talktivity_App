/**
 * UserSelections - All 15 onboarding fields with proper types
 * 
 * This interface represents the complete onboarding form data that users provide
 * during the onboarding process. All fields correspond to database columns.
 */
export interface UserSelections {
  skillToImprove: string | null;
  languageStatement: string | null;
  industry: string | null;
  speakingFeelings: string | null;
  speakingFrequency: string | null;
  mainGoal: string | null;
  gender: string | null;
  currentLearningMethods: string[];
  currentLevel: string | null;
  nativeLanguage: string | null;
  knownWords1: string[];
  knownWords2: string[];
  interests: string[];
  englishStyle: string | null;
  tutorStyle: string[];
  userName: string;
}

/**
 * Initial empty state for UserSelections
 */
export const INITIAL_USER_SELECTIONS: UserSelections = {
  skillToImprove: null,
  languageStatement: null,
  industry: null,
  speakingFeelings: null,
  speakingFrequency: null,
  mainGoal: null,
  gender: null,
  currentLearningMethods: [],
  currentLevel: null,
  nativeLanguage: null,
  knownWords1: [],
  knownWords2: [],
  interests: [],
  englishStyle: null,
  tutorStyle: [],
  userName: "user",
};

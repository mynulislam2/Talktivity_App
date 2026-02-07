/**
 * Navigation Types
 * 
 * Centralized navigation param lists and types
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  FreeTrial: undefined;
  FreeTrialSuccess: undefined;
};

// Learning Stack (Topics, Practice, Call, Roleplay, Progress, Report, Quiz)
export type LearningStackParamList = {
  TopicsScreen: undefined;
  PracticeScreen: { topicId?: string; topicName?: string };
  CallScreen: { topicId?: string };
  RoleplayScreen: { scenarioId?: string };
  ProgressScreen: undefined;
  ReportScreen: { sessionId: string; sessionType: 'practice' | 'call' | 'roleplay'; reportData: any };
  QuizScreen: { topicId?: string; topicName?: string };
  ListeningQuizScreen: { topicId?: string; topicName?: string };
};

// Social Stack (Chat, Community, Leaderboard)
export type SocialStackParamList = {
  ChatScreen: { contactId?: string };
  CommunityScreen: undefined;
  LeaderboardScreen: undefined;
};

// Profile Stack (Profile, Edit, Settings, Subscription, Payment)
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  SubscriptionScreen: undefined;
  SubscriptionPlans: undefined;
  Checkout: { plan: any };
  PaymentSuccess: { plan: any; amount: string };
  PaymentFailure: { reason: string; plan: any };
  PaymentCancel: { plan: any; amount: string };
  Terms: undefined;
  Privacy: undefined;
  About: undefined;
};

// Main Stack (Bottom tabs)
export type MainStackParamList = {
  Home: undefined;
  LearningStack: undefined;
  SocialStack: undefined;
  ProfileStack: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Screen Props
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type FreeTrialScreenProps = NativeStackScreenProps<AuthStackParamList, 'FreeTrial'>;
export type FreeTrialSuccessScreenProps = NativeStackScreenProps<AuthStackParamList, 'FreeTrialSuccess'>;
export type AuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login' | 'Signup' | 'ForgotPassword' | 'FreeTrial' | 'FreeTrialSuccess'>;

// Main Screen Props (with both stack and tab navigation)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type LearningScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Learning'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SocialScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Social'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Learning Stack Screen Props
export type TopicsScreenProps = NativeStackScreenProps<LearningStackParamList, 'TopicsScreen'>;
export type PracticeScreenProps = NativeStackScreenProps<LearningStackParamList, 'PracticeScreen'>;
export type CallScreenProps = NativeStackScreenProps<LearningStackParamList, 'CallScreen'>;
export type RoleplayScreenProps = NativeStackScreenProps<LearningStackParamList, 'RoleplayScreen'>;
export type ProgressScreenProps = NativeStackScreenProps<LearningStackParamList, 'ProgressScreen'>;
export type ReportScreenProps = NativeStackScreenProps<LearningStackParamList, 'ReportScreen'>;
export type QuizScreenProps = NativeStackScreenProps<LearningStackParamList, 'QuizScreen'>;
export type ListeningQuizScreenProps = NativeStackScreenProps<LearningStackParamList, 'ListeningQuizScreen'>;
export type LearningStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'LearningStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Social Stack Screen Props
export type ChatScreenProps = NativeStackScreenProps<SocialStackParamList, 'ChatScreen'>;
export type CommunityScreenProps = NativeStackScreenProps<SocialStackParamList, 'CommunityScreen'>;
export type LeaderboardScreenProps = NativeStackScreenProps<SocialStackParamList, 'LeaderboardScreen'>;
export type SocialStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'SocialStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Profile Stack Screen Props
export type ProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>;
export type EditProfileScreenProps = NativeStackScreenProps<ProfileStackParamList, 'EditProfileScreen'>;
export type SettingsScreenProps = NativeStackScreenProps<ProfileStackParamList, 'SettingsScreen'>;
export type SubscriptionScreenProps = NativeStackScreenProps<ProfileStackParamList, 'SubscriptionScreen'>;
export type SubscriptionPlansProps = NativeStackScreenProps<ProfileStackParamList, 'SubscriptionPlans'>;
export type CheckoutScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Checkout'>;
export type PaymentSuccessScreenProps = NativeStackScreenProps<ProfileStackParamList, 'PaymentSuccess'>;
export type PaymentFailureScreenProps = NativeStackScreenProps<ProfileStackParamList, 'PaymentFailure'>;
export type PaymentCancelScreenProps = NativeStackScreenProps<ProfileStackParamList, 'PaymentCancel'>;
export type TermsScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Terms'>;
export type PrivacyScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Privacy'>;
export type AboutScreenProps = NativeStackScreenProps<ProfileStackParamList, 'About'>;
export type ProfileStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'ProfileStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

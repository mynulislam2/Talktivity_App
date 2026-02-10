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
  WelcomeOnboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  CallScreen: { CallStart?: boolean } | undefined;
  ReportScreen: { sessionId: string; sessionType: 'practice' | 'call'; reportData: any } | undefined;
  SubscriptionScreen: undefined; // For onboarding flow (no bottom tabs)
  FreeTrial: undefined;
  FreeTrialSuccess: undefined;
  Checkout: { plan: 'Basic' | 'Pro' };
  PaymentSuccess: { plan: any; amount: string };
  PaymentFailure: { reason: string; plan: any };
  PaymentCancel: { orderId?: string; tranId?: string; response?: any };
  Privacy: undefined;
  Terms: undefined;
};

// Learning Stack (Topics, Practice, Call, Progress, Report, Quiz)
export type LearningStackParamList = {
  TopicsScreen: undefined;
  PracticeScreen: { topicId?: string; topicName?: string };
  CallScreen: { topicId?: string };
  ProgressScreen: undefined;
  ReportScreen: { sessionId: string; sessionType: 'practice' | 'call'; reportData: any };
  TodaysReportScreen: undefined;
  QuizScreen: { topicId?: string; topicName?: string };
  ListeningQuizScreen: { topicId?: string; topicName?: string };
};

// Social Stack (Chat, Community, Leaderboard)
export type SocialStackParamList = {
  ChatScreen: { contactId?: string; dmId?: number };
  CommunityScreen: undefined;
  DMChatScreen: { dmId: number };
  GroupChatScreen: { groupId: number };
  LeaderboardScreen: undefined;
};

// Profile Stack (Profile, Edit, Settings, Subscription, Payment, Free Trial)
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  SubscriptionScreen: undefined;
  SubscriptionPlans: undefined;
  Checkout: { plan: 'Basic' | 'Pro' };
  PaymentSuccess: { plan: any; amount: string };
  PaymentFailure: { reason: string; plan: any };
  PaymentCancel: { orderId?: string; tranId?: string; response?: any };
  FreeTrial: undefined;
  FreeTrialSuccess: undefined;
  Terms: undefined;
  Privacy: undefined;
  Refund: undefined;
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
export type AuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login' | 'Signup' | 'ForgotPassword'>;

// Main Screen Props (with both stack and tab navigation)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;


export type ProfileScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'ProfileStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Learning Stack Screen Props
export type TopicsScreenProps = NativeStackScreenProps<LearningStackParamList, 'TopicsScreen'>;
export type PracticeScreenProps = NativeStackScreenProps<LearningStackParamList, 'PracticeScreen'>;
export type CallScreenProps = NativeStackScreenProps<LearningStackParamList, 'CallScreen'>;
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
export type DMChatScreenProps = NativeStackScreenProps<SocialStackParamList, 'DMChatScreen'>;
export type GroupChatScreenProps = NativeStackScreenProps<SocialStackParamList, 'GroupChatScreen'>;
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
export type FreeTrialScreenProps = NativeStackScreenProps<ProfileStackParamList, 'FreeTrial'>;
export type FreeTrialSuccessScreenProps = NativeStackScreenProps<ProfileStackParamList, 'FreeTrialSuccess'>;
export type TermsScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Terms'>;
export type PrivacyScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Privacy'>;
export type RefundScreenProps = NativeStackScreenProps<ProfileStackParamList, 'Refund'>;
export type AboutScreenProps = NativeStackScreenProps<ProfileStackParamList, 'About'>;
export type ProfileStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'ProfileStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

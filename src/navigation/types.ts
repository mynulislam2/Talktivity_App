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
  ForgotPassword: undefined;
  Privacy: undefined;
  Terms: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  PracticeScreen: { topicId?: string; topicName?: string } | undefined;
  QuizScreen: { topicId?: string; topicName?: string } | undefined;
  ReviewScreen: undefined;
  ListeningScreen: { roomName?: string } | undefined;
  ListeningQuizScreen: { topicId?: string; topicName?: string } | undefined;
  ReportScreen: {
    sessionId: string;
    sessionType: 'practice' | 'call';
    reportData: any;
  };
  TodaysReportScreen: undefined;
};

// Learning Stack (Topics, Practice, Call, Progress, Report, Quiz)
export type LearningStackParamList = {
  TopicsScreen: undefined;
  PracticeScreen: { topicId?: string; topicName?: string };
  ProgressScreen: undefined;
  ReportScreen: {
    sessionId: string;
    sessionType: 'practice' | 'call';
    reportData: any;
  };
  TodaysReportScreen: undefined;
  QuizScreen: { topicId?: string; topicName?: string };
  ListeningScreen: undefined;
  ListeningQuizScreen: { topicId?: string; topicName?: string };
};

// Roleplay Stack (Topics, Session, Practice)
export type RoleplayStackParamList = {
  RoleplayList: undefined;
  RoleplaySession: undefined;
  PracticeScreen: { topicId?: string; topicName?: string } | undefined;
};

// Social Stack (Chat, Community)
export type SocialStackParamList = {
  ChatScreen: { contactId?: string; dmId?: number };
  CommunityScreen: undefined;
  DMChatScreen: { dmId: number };
  GroupChatScreen: { groupId: number };
};

// Profile Stack (Profile, Edit, Settings, Leaderboard)
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  SettingsScreen: undefined;
  ChangePasswordScreen: undefined;
  LeaderboardScreen: undefined;
  Terms: undefined;
  Privacy: undefined;
  Refund: undefined;
  About: undefined;
};

// Main Stack (Bottom tabs)
export type MainStackParamList = {
  Home: undefined;
  LearningStack: undefined;
  RoleplayStack: undefined;
  SocialStack: undefined;
  ProfileStack: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Auth Screen Props
export type LoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;
export type AuthScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Login' | 'ForgotPassword'
>;

// Main Screen Props (with both stack and tab navigation)
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ProfileTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'ProfileStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Learning Stack Screen Props
export type TopicsScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'TopicsScreen'
>;
export type PracticeScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'PracticeScreen'
>;
export type ProgressScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'ProgressScreen'
>;
export type ReportScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'ReportScreen'
>;
export type QuizScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'QuizScreen'
>;
export type ListeningQuizScreenProps = NativeStackScreenProps<
  LearningStackParamList,
  'ListeningQuizScreen'
>;
export type LearningStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'LearningStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Roleplay Stack Screen Props
export type RoleplayListScreenProps = NativeStackScreenProps<
  RoleplayStackParamList,
  'RoleplayList'
>;
export type RoleplaySessionScreenProps = NativeStackScreenProps<
  RoleplayStackParamList,
  'RoleplaySession'
>;
export type RoleplayStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'RoleplayStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Social Stack Screen Props
export type ChatScreenProps = NativeStackScreenProps<
  SocialStackParamList,
  'ChatScreen'
>;
export type CommunityScreenProps = NativeStackScreenProps<
  SocialStackParamList,
  'CommunityScreen'
>;
export type DMChatScreenProps = NativeStackScreenProps<
  SocialStackParamList,
  'DMChatScreen'
>;
export type GroupChatScreenProps = NativeStackScreenProps<
  SocialStackParamList,
  'GroupChatScreen'
>;
export type SocialStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'SocialStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Profile Stack Screen Props
export type ProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'ProfileScreen'
>;
export type EditProfileScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'EditProfileScreen'
>;
export type SettingsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'SettingsScreen'
>;

export type TermsScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'Terms'
>;
export type PrivacyScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'Privacy'
>;
export type RefundScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'Refund'
>;
export type AboutScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'About'
>;
export type LeaderboardScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'LeaderboardScreen'
>;
export type ProfileStackProps = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, 'ProfileStack'>,
  NativeStackScreenProps<RootStackParamList>
>;

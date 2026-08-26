/**
 * Second layout harness — the surfaces the browser walks could never reach.
 *
 * The tab walk and the unlock-chain walk drive the real app, so they cover
 * every screen that is one tap from a signed-in session. Five are not: the
 * three live-call screens need a LiveKit room and a microphone, the quiz needs
 * a generated question set, and a DM needs a second human. Those were the only
 * screens left with a static read instead of a measurement.
 *
 * They are mounted here from their presentational components with worst-case
 * but realistic content — a long topic title, a full-length question, a long
 * full name — so `harness-audit.js` measures the same react-native-web layout
 * the device runs.
 *
 * Point package.json `main` here, run the audit, then point it back at
 * App.tsx. Nothing imports this file in a native build.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';

import { applyGlobalFontDefaults, applyGlobalTextScaling } from '../src/theme/fonts';
import { appNavigationTheme } from '../src/theme/navigationTheme';
import { AppBackground } from '../src/components/common/AppBackground';
import { ProgressPageShell } from '../src/components/profile/ProgressPageShell';
import { CEFRProgressCard } from '../src/components/profile/CEFRProgressCard';
import { PracticeContent } from '../src/components/practice/PracticeContent';
import { GeneralPracticeContent } from '../src/components/generalpractice/GeneralPracticeContent';
import { RoleplayContent } from '../src/components/roleplay/RoleplayContent';
import { QuizShell } from '../src/components/quiz/QuizShell';
import { ProgressHeader } from '../src/components/quiz/ProgressHeader';
import { QuestionCard } from '../src/components/quiz/QuestionCard';
import { OptionsList } from '../src/components/quiz/OptionsList';
import { AnswerFeedback } from '../src/components/quiz/AnswerFeedback';
import { PronunciationControls } from '../src/components/quiz/PronunciationControls';
import { QuizCongratulations } from '../src/components/quiz/QuizCongratulations';
import { QuizLoadingCard } from '../src/components/quiz/QuizLoadingCard';
import { MessageBubble } from '../src/components/chat/MessageBubble';
import { UserProfilePopup } from '../src/components/community/UserProfilePopup';

applyGlobalFontDefaults();
applyGlobalTextScaling();

const STATE = {
  profile: {
    profile: { id: 1, email: 'mynul@talktivity.app', full_name: 'Mynul Islam' },
    progressStats: null,
  },
  subscription: {
    currentSubscription: {
      active: true,
      subscription: { plan_type: 'BD_3Month', is_free_trial: false },
    },
  },
  course: { courseStatus: null },
  auth: { user: { id: 1 }, token: 'harness' },
  chat: {},
  community: {},
};

const store = {
  getState: () => STATE,
  subscribe: () => () => {},
  dispatch: (action: unknown) => action,
  replaceReducer: () => {},
} as never;

/** Idle: the state a call screen is in before the user taps Start. */
const IDLE_SESSION = {
  agentState: 'disconnected',
  isConnected: false,
  isConnecting: false,
  connectionDetails: null,
} as never;

/** A topic title at the long end of the range in topics.json. */
const LONG_TOPIC = 'Describing a Memorable Childhood Celebration';

const QUESTION = {
  id: 'q1',
  type: 'speaking',
  question:
    'Which sentence uses the present perfect continuous correctly when describing an ongoing celebration?',
  options: [
    { id: 'a', text: 'They have been celebrating the festival since Thursday morning.' },
    { id: 'b', text: 'They are celebrate the festival since Thursday morning.' },
    { id: 'c', text: 'They celebrating the festival since Thursday morning.' },
    { id: 'd', text: 'They has been celebrating the festival since Thursday morning.' },
  ],
  correctOptionIds: ['a'],
  explanation:
    'The present perfect continuous pairs "have been" with the -ing form to describe something that started in the past and is still happening.',
} as never;

const LOADING_STEPS = [
  { name: 'Reviewing your conversation', icon: '🗣️', color: '#2879ff' },
  { name: 'Checking grammar and vocabulary', icon: '📘', color: '#22c55e' },
  { name: 'Writing your questions', icon: '✍️', color: '#f59e0b' },
];

const PROFICIENCY = {
  overallScore: 100,
  overallLevel: 'B2',
  confidence: 'established',
  skills: {
    fluency: { score: 100, level: 'B2', trend: 'improving' },
    grammar: { score: 100, level: 'B1', trend: 'stable' },
    vocabulary: { score: 100, level: 'B2', trend: 'improving' },
    discourse: { score: 100, level: 'B1', trend: 'declining' },
  },
  progressToNextLevel: 62,
  nextLevel: 'C1',
  sessionCount: 14,
} as never;

const LONG_NAME = 'Muhammad Abdur Rahman Chowdhury';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

export default function CallQuizChatHarness() {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 24, left: 0, right: 0, bottom: 0 },
      }}
    >
      <Provider store={store}>
        <NavigationContainer theme={appNavigationTheme}>
          <AppBackground>
            <ScrollView contentContainerStyle={styles.page}>
              <Section title="cefr-radar">
                <View style={styles.shellHost}>
                  <ProgressPageShell activeTab="profile" header={null}>
                    <CEFRProgressCard proficiency={PROFICIENCY} startingLevel="upper" />
                  </ProgressPageShell>
                </View>
              </Section>

              <Section title="practice-call">
                <View style={styles.screenHost}>
                  <PracticeContent
                    topicTitle={LONG_TOPIC}
                    sessionState={IDLE_SESSION}
                    connectionDetails={null}
                    onConnect={() => {}}
                    onDisconnect={() => {}}
                    onStateChange={() => {}}
                    canStartSession
                    timeLoading={false}
                    remainingTime="10:00"
                    onBack={() => {}}
                  />
                </View>
              </Section>

              <Section title="general-practice">
                <View style={styles.screenHost}>
                  <GeneralPracticeContent
                    topicTitle={LONG_TOPIC}
                    sessionState={IDLE_SESSION}
                    connectionDetails={null}
                    onConnect={() => {}}
                    onDisconnect={() => {}}
                    onStateChange={() => {}}
                    canStartSession
                    timeLoading={false}
                    onBack={() => {}}
                  />
                </View>
              </Section>

              <Section title="roleplay-call">
                <View style={styles.screenHost}>
                  <RoleplayContent
                    topicTitle={LONG_TOPIC}
                    sessionState={IDLE_SESSION}
                    connectionDetails={null}
                    onConnect={() => {}}
                    onDisconnect={() => {}}
                    onStateChange={() => {}}
                    canStartSession
                    timeLoading={false}
                    remainingTime="55:00"
                    onBack={() => {}}
                  />
                </View>
              </Section>

              <Section title="quiz-question">
                <View style={styles.screenHost}>
                  <QuizShell
                    fullScreen={false}
                    header={<ProgressHeader type="speaking" current={4} total={10} score={3} />}
                    footer={<AnswerFeedback show correct={false} />}
                  >
                    <QuestionCard question={QUESTION} isAnswered />
                    <OptionsList
                      options={(QUESTION as never as { options: never[] }).options}
                      selectedIds={['b']}
                      correctIds={['a']}
                      disabled
                      showCorrectness
                      onSelect={() => {}}
                    />
                  </QuizShell>
                </View>
              </Section>

              <Section title="quiz-pronunciation">
                <PronunciationControls
                  listening
                  userSpeech="They have been celebrating the festival since Thursday morning."
                  onStart={() => {}}
                  onStop={() => {}}
                />
              </Section>

              <Section title="quiz-congratulations">
                <View style={styles.modalHost}>
                  <QuizCongratulations
                    quizType="listening"
                    score={8}
                    totalQuestions={10}
                    onTryAgain={() => {}}
                    onNext={() => {}}
                  />
                </View>
              </Section>

              <Section title="quiz-loading">
                <View style={styles.modalHost}>
                  <QuizLoadingCard
                    title="Preparing your quiz"
                    subtitle="Turning your conversation into questions."
                    steps={LOADING_STEPS}
                  />
                </View>
              </Section>

              <Section title="dm-chat">
                <MessageBubble
                  id={1}
                  content="I practised the pronunciation drill twice today and the second attempt felt much smoother."
                  timestamp="10:24 PM"
                  isOwn={false}
                  authorName={LONG_NAME}
                />
                <MessageBubble
                  id={2}
                  content="Great — try recording yourself next time."
                  timestamp="10:26 PM"
                  isOwn
                  authorName="Mynul Islam"
                />
              </Section>

              <Section title="user-profile-popup">
                <View style={styles.modalHost}>
                  <UserProfilePopup
                    visible
                    user={{ id: 7, full_name: LONG_NAME, level: 'Upper-Intermediate' }}
                    onClose={() => {}}
                    onMessage={() => {}}
                    isOnline
                  />
                </View>
              </Section>
            </ScrollView>
          </AppBackground>
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 80 },
  section: { marginBottom: 28 },
  sectionLabel: {
    color: '#7c7c8a',
    fontSize: 10,
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shellHost: { height: 420 },
  screenHost: { height: 760 },
  modalHost: { height: 460 },
});

registerRootComponent(CallQuizChatHarness);

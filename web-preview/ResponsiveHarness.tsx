/**
 * Layout harness for the responsive audit — NOT part of the shipped app.
 *
 * The app's own screens cannot be measured in a browser: they sit behind a
 * login that talks to https://server.talktivity.app, which a page served from
 * localhost cannot reach. This entry mounts the components that the small-
 * screen bug report named, with fixed worst-case data, so `responsive-audit.js`
 * can measure real react-native-web layout at 320 / 360 / 393 / 412pt.
 *
 * The Redux store is a hand-rolled stub: react-redux only needs
 * `getState` / `subscribe` / `dispatch`, and every hook these components use
 * reads state through a selector and guards its dispatch on that state.
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
import { Header } from '../src/components/home/Header';
import { HomeDashboardScreen } from '../src/components/home/HomeDashboardScreen';
import { HomeViewToggle } from '../src/components/home/HomeViewToggle';
import { HomeTodayPlanScreen } from '../src/components/home/HomeTodayPlanScreen';
import { ProfileActivityCard } from '../src/components/profile/ProfileActivityCard';
import { ProgressPageShell } from '../src/components/profile/ProgressPageShell';
import { ProfileHeroStats } from '../src/components/profile/ProfileHeroStats';
import { EndSessionModal } from '../src/components/common/EndSessionModal';

applyGlobalFontDefaults();
applyGlobalTextScaling();

/** Worst-case-but-real state: a named user, an upgradeable plan, zeroed stats. */
const STATE = {
  profile: {
    profile: {
      id: 1,
      email: 'mynul@talktivity.app',
      full_name: 'Mynul Islam',
      isEmailVerified: true,
      emailVerifiedAt: null,
    },
    profileDataLoading: false,
    progressStats: null,
    progressLoading: false,
  },
  subscription: {
    currentSubscription: {
      active: true,
      subscription: { plan_type: 'BD_1Month', is_free_trial: false },
    },
  },
  course: { courseStatus: null },
  auth: { user: null, token: null },
};

const store = {
  getState: () => STATE,
  subscribe: () => () => {},
  dispatch: (action: unknown) => action,
  replaceReducer: () => {},
} as never;

const PROGRESS_STATS = {
  courseProgress: {
    progress: {
      total_practice_time: 0,
      complete_days: 0,
      total_xp: 0,
      current_streak: 0,
    },
  },
} as never;

/** A real day: speaking available, everything downstream still locked. */
const TODAY_PLAN_COURSE = {
  course: {
    dayType: 'all_activities',
    todayTopic: { id: 1, title: 'Celebrating a Holiday' },
    todayListeningTopic: null,
  },
} as never;

const TODAY_PLAN_BOOLEANS = {
  speakingCompleted: false,
  quizCompleted: false,
  listeningCompleted: false,
  listeningQuizCompleted: false,
  reviewUnlocked: false,
} as never;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      {children}
    </View>
  );
}

export default function ResponsiveHarness() {
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
              <Section title="home-header">
                <Header />
              </Section>

              <Section title="home-dashboard">
                <View style={styles.dashboard}>
                  <HomeDashboardScreen practiceMinutes="5" onOpenTodayPlan={() => {}} />
                </View>
              </Section>

              <Section title="view-toggle">
                <HomeViewToggle viewMode="today" onViewModeChange={() => {}} />
              </Section>

              <Section title="todays-plan">
                <View style={styles.planHost}>
                  <HomeTodayPlanScreen
                    courseStatus={TODAY_PLAN_COURSE}
                    booleans={TODAY_PLAN_BOOLEANS}
                    practiceMinutes="5"
                    remainingTime="2:30"
                    hasSpeakingTimeLeft
                    onBack={() => {}}
                    onSwitchMode={() => {}}
                  />
                </View>
              </Section>

              <Section title="profile-cards">
                {/* The real shell, so the cards get the real gutter. */}
                <View style={styles.shellHost}>
                  <ProgressPageShell activeTab="profile" header={null}>
                    <ProfileHeroStats progressStats={PROGRESS_STATS} />
                    <View style={styles.cardGap} />
                    <ProfileActivityCard progressStats={PROGRESS_STATS} />
                  </ProgressPageShell>
                </View>
              </Section>

              <Section title="end-session-modal">
                <View style={styles.modalHost}>
                  <EndSessionModal visible onClose={() => {}} onConfirm={() => {}} />
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
  // The dashboard is a ScrollView; give it a height so it lays out inside the
  // harness page rather than collapsing to zero.
  dashboard: { height: 620 },
  planHost: { height: 620 },
  shellHost: { height: 700 },
  cardGap: { height: 24 },
  modalHost: { height: 300 },
});

registerRootComponent(ResponsiveHarness);

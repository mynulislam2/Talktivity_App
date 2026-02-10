/**
 * Redux Store Configuration - React Native
 * 
 * Configures Redux Toolkit store with Redux Persist for AsyncStorage
 * All slices copied unchanged from Next.js version
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

import authReducer from './slices/authSlice';
import onboardingReducer from './slices/onboardingSlice';
import lifecycleReducer from './slices/lifecycleSlice';
import callReducer from './slices/callSlice';
import reportReducer from './slices/reportSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import paymentReducer from './slices/paymentSlice';
import communityReducer from './slices/communitySlice';
import chatReducer from './slices/chatSlice';
import profileReducer from './slices/profileSlice';
import courseReducer from './slices/courseSlice';
import topicsReducer from './slices/topicsSlice';
import progressAnalyticsReducer from './slices/progressAnalyticsSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import todayReportReducer from './slices/todayReportSlice';
import quizReducer from './slices/quizSlice';
import usageReducer from './slices/usageSlice';

/**
 * Redux Persist configuration
 * Uses AsyncStorage for React Native (replaces localStorage)
 */
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  whitelist: [
    'auth',
    'profile',
    'course',
    'subscription',
    'onboarding',
  ],
};

/**
 * Combine all reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  onboarding: onboardingReducer,
  lifecycle: lifecycleReducer,
  call: callReducer,
  report: reportReducer,
  subscription: subscriptionReducer,
  payment: paymentReducer,
  community: communityReducer,
  chat: chatReducer,
  profile: profileReducer,
  course: courseReducer,
  topics: topicsReducer,
  progressAnalytics: progressAnalyticsReducer,
  leaderboard: leaderboardReducer,
  todayReport: todayReportReducer,
  quiz: quizReducer,
  usage: usageReducer,
});

/**
 * Create persistent reducer for AsyncStorage
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/**
 * Configure store with middleware that handles Redux Persist actions
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/**
 * Create persistor for rehydrating from AsyncStorage
 */
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

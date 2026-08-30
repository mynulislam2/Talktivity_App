/**
 * Jest Setup File
 *
 * Initialize test environment and mock dependencies
 */

import '@testing-library/jest-dom';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiSet: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock Expo modules.
// The recording surface is included deliberately: the review flow and the
// pronunciation quiz both record audio, and a mock that omits Recording makes
// `Audio.Recording` silently undefined — the recording path would then look
// "unsupported" in tests instead of failing loudly. Individual suites still
// override this with jest.mock when they need to assert on the calls.
jest.mock('expo-av', () => {
  const recording = {
    prepareToRecordAsync: jest.fn(() => Promise.resolve({})),
    startAsync: jest.fn(() => Promise.resolve({})),
    stopAndUnloadAsync: jest.fn(() => Promise.resolve({})),
    getStatusAsync: jest.fn(() => Promise.resolve({ isRecording: false })),
    getURI: jest.fn(() => 'file:///tmp/mock-recording.m4a'),
  };
  return {
    Audio: {
      setAudioModeAsync: jest.fn(),
      setIsAudioEnabledAsync: jest.fn(),
      Sound: {
        createAsync: jest.fn(),
      },
      Recording: {
        createAsync: jest.fn(() => Promise.resolve({ recording, status: {} })),
      },
      RecordingOptionsPresets: {
        HIGH_QUALITY: { android: { extension: '.m4a' }, ios: { extension: '.m4a' } },
        LOW_QUALITY: { android: { extension: '.m4a' }, ios: { extension: '.m4a' } },
      },
      requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
      getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true, status: 'granted' })),
    },
  };
});

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'images',
  },
}));

// Mock navigation (keep real exports like DarkTheme/DefaultTheme so theme
// modules that import them still work under test; only override the hooks).
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setParams: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: {},
  })),
  useIsFocused: jest.fn(() => true),
}));

// Suppress console warnings in tests
global.console.warn = jest.fn();
global.console.error = jest.fn();

// Setup global test timeout
jest.setTimeout(10000);

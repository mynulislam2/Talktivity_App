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

// Mock Expo modules
jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(),
  Sound: {
    createAsync: jest.fn(),
  },
}));

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

// Mock navigation
jest.mock('@react-navigation/native', () => ({
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

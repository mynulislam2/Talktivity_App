/**
 * Jest Configuration
 *
 * Testing setup and configuration for React Native app
 */

module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'Hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'service/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@react-native|@expo|expo|react-native|@react-navigation|react-native-gesture-handler|@react-native-async-storage)/)',
  ],
  globals: {
    __DEV__: true,
  },
};

/**
 * Jest Configuration
 *
 * Single source of truth. The `jest` key in package.json was removed so the
 * two configs can no longer disagree (they did: react-native vs jest-expo,
 * which made every suite fail to parse).
 */

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // tsconfig.json maps @/service/* -> ./src/services/* and @/* -> ./src/*.
    // The more specific alias MUST come first or it never matches.
    '^@/service/(.*)$': '<rootDir>/src/services/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**', '!**/*.d.ts'],
  transformIgnorePatterns: [
    // double-metaphone (and its `stemmer`-style deps) ship ESM only, so Jest
    // has to transform them; Metro already handles this at runtime.
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@livekit/.*|livekit-client|double-metaphone))',
  ],
};

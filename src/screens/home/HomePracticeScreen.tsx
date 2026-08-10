/**
 * HomePracticeScreen (React Native)
 *
 * Thin wrapper around PracticeScreen for the Home tab.
 * Forces practice mode regardless of AsyncStorage flags.
 */

import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PracticeScreen from '../learning/PracticeScreen';

export default function HomePracticeScreen() {
  useEffect(() => {
    // Ensure this is always treated as a practice session
    AsyncStorage.setItem('isRoleplaySession', 'false');
    AsyncStorage.removeItem('selectedRoleplayTopic');
  }, []);

  return <PracticeScreen />;
}

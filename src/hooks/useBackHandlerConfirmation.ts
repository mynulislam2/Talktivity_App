/**
 * useBackHandlerConfirmation Hook
 *
 * Intercepts the Android hardware back button when a live AI conversation is active
 * and prompts the user with an "End Conversation?" confirmation dialog before popping.
 */

import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useBackHandlerConfirmation = (
  isActive: boolean,
  onRequestDisconnect: () => void
) => {
  useEffect(() => {
    if (!isActive) return;

    const handleBackPress = () => {
      onRequestDisconnect();
      return true; // Intercept & block default back navigation
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [isActive, onRequestDisconnect]);
};

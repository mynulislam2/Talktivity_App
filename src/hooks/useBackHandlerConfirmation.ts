/**
 * useBackHandlerConfirmation Hook
 *
 * Intercepts the Android hardware back button when a live AI conversation is active
 * and prompts the user with an "End Conversation?" confirmation dialog before popping.
 */

import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';

export const useBackHandlerConfirmation = (
  isActive: boolean,
  onConfirmDisconnect: () => void,
  title: string = 'End Conversation?',
  message: string = 'Are you sure you want to end your current call session?'
) => {
  useEffect(() => {
    if (!isActive) return;

    const handleBackPress = () => {
      Alert.alert(
        title,
        message,
        [
          { text: 'Continue Call', style: 'cancel', onPress: () => {} },
          {
            text: 'End Call',
            style: 'destructive',
            onPress: () => {
              onConfirmDisconnect();
            },
          },
        ],
        { cancelable: true }
      );
      return true; // Intercept & block default back navigation
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [isActive, onConfirmDisconnect, title, message]);
};

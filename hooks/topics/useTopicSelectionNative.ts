/**
 * useTopicSelection Hook (React Native)
 * 
 * Handles topic selection and navigation to Practice page.
 */

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import type { Topic } from '@/types/topics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseTopicSelectionReturn {
  handleTopicSelect: (topic: Topic, categoryName: string) => void;
  handleCustomRolePlay: () => void;
}

export function useTopicSelectionNative(): UseTopicSelectionReturn {
  const navigation = useNavigation();

  const handleTopicSelect = useCallback(
    async (topic: Topic, categoryName: string) => {
      // Mark roleplay vs practice based on category
      const isRoleplay = categoryName === 'Role Play Scenarios';
      await AsyncStorage.setItem('isRoleplaySession', isRoleplay ? 'true' : 'false');

      // Save topic to AsyncStorage
      if (isRoleplay) {
        await AsyncStorage.setItem('selectedRoleplayTopic', JSON.stringify(topic));
      } else {
        await AsyncStorage.setItem('selectedTopic', JSON.stringify(topic));
      }

      // Navigate to Practice page
      navigation.dispatch(
        CommonActions.navigate({
          name: 'LearningStack',
          params: {
            screen: 'PracticeScreen',
          },
        })
      );
    },
    [navigation]
  );

  const handleCustomRolePlay = useCallback(() => {
    // This is handled by the modal component
    // Just a placeholder for consistency
  }, []);

  return {
    handleTopicSelect,
    handleCustomRolePlay,
  };
}

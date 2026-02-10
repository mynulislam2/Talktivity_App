/**
 * useTopicSelection Hook
 * 
 * Handles topic selection and navigation to Practice page.
 */

import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import type { Topic } from '@/types/topics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseTopicSelectionReturn {
  handleTopicSelect: (topic: Topic, categoryName: string) => void;
  handleCustomRolePlay: () => void;
}

export function useTopicSelection(): UseTopicSelectionReturn {
  const router = useRouter();

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
      router.push('/Practice' as any);
    },
    [router]
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

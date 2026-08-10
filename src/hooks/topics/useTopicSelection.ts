import { useCallback } from 'react';
import type { Topic } from '@/types/topics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UseTopicSelectionReturn {
  handleTopicSelect: (topic: Topic) => void;
  handleCustomRolePlay: () => void;
}

export function useTopicSelection(): UseTopicSelectionReturn {
  const handleTopicSelect = useCallback(async (topic: Topic) => {
    await AsyncStorage.setItem('isRoleplaySession', 'true');
    await AsyncStorage.setItem('selectedRoleplayTopic', JSON.stringify(topic));
  }, []);

  const handleCustomRolePlay = useCallback(() => {
    // Handled by modal component
  }, []);

  return {
    handleTopicSelect,
    handleCustomRolePlay,
  };
}

/**
 * useTopicSelection Hook
 * 
 * Handles topic selection and navigation to Practice page.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Topic } from '@/types/topics';

export interface UseTopicSelectionReturn {
  handleTopicSelect: (topic: Topic, categoryName: string) => void;
  handleCustomRolePlay: () => void;
}

export function useTopicSelection(): UseTopicSelectionReturn {
  const router = useRouter();

  const handleTopicSelect = useCallback(
    (topic: Topic, categoryName: string) => {

      // Mark roleplay vs practice based on category
      const isRoleplay = categoryName === 'Role Play Scenarios';
      localStorage.setItem('isRoleplaySession', isRoleplay ? 'true' : 'false');

      // Save topic to localStorage
      // - Practice sessions use 'selectedTopic' (existing behavior)
      // - Roleplay sessions use a dedicated key to avoid conflicting with practice topic
      if (isRoleplay) {
        localStorage.setItem('selectedRoleplayTopic', JSON.stringify(topic));
      } else {
        localStorage.setItem('selectedTopic', JSON.stringify(topic));
      }

      // Navigate to Practice page; it will initiate the correct session type
      router.push('/Practice');
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

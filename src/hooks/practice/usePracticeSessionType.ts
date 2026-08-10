import { useState, useEffect } from 'react';
import type { PracticeSessionType } from '@/types/practice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePracticeSessionType(): PracticeSessionType {
  const [sessionType, setSessionType] =
    useState<PracticeSessionType>('practice');

  useEffect(() => {
    AsyncStorage.getItem('isRoleplaySession').then((storedValue) => {
      if (storedValue) {
        setSessionType(storedValue === 'true' ? 'roleplay' : 'practice');
      }
    });
  }, []);

  return sessionType;
}

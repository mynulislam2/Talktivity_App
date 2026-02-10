/**
 * usePracticeSessionType Hook
 * 
 * Detects whether the current session is 'practice' or 'roleplay'
 * based on localStorage flag.
 */

import { useState, useEffect } from 'react';
import type { PracticeSessionType } from '@/types/practice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function usePracticeSessionType(): PracticeSessionType {
  const [sessionType, setSessionType] = useState<PracticeSessionType>('practice');

  useEffect(() => {
    const checkType = async () => {
      try {
        const value = await AsyncStorage.getItem('isRoleplaySession');
        setSessionType(value === 'true' ? 'roleplay' : 'practice');
      } catch (error) {
        setSessionType('practice');
      }
    };
    checkType();
  }, []);

  return sessionType;
}

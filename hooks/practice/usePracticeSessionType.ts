/**
 * usePracticeSessionType Hook
 * 
 * Detects whether the current session is 'practice' or 'roleplay'
 * based on localStorage flag.
 */

import { useState, useEffect } from 'react';
import type { PracticeSessionType } from '@/types/practice';

export function usePracticeSessionType(): PracticeSessionType {
  const [sessionType, setSessionType] = useState<PracticeSessionType>(() => {
    if (typeof window === 'undefined') {
      return 'practice';
    }
    const isRoleplay = localStorage.getItem('isRoleplaySession') === 'true';
    return isRoleplay ? 'roleplay' : 'practice';
  });

  useEffect(() => {
    const isRoleplay = localStorage.getItem('isRoleplaySession') === 'true';
    setSessionType(isRoleplay ? 'roleplay' : 'practice');
  }, []);

  return sessionType;
}

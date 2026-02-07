import { useMemo } from 'react';
import { authService } from '@/service/AuthService';

export interface ChatIdentity {
  userId: number | null;
  fullName: string;
  profilePicture: string | null;
}

/**
 * Single source of truth for "current chat user" identity.
 */
export function useChatIdentity(): ChatIdentity {
  return useMemo(() => {
    const user = authService.getUser();
    return {
      userId: user?.id ?? null,
      fullName: user?.full_name || 'You',
      profilePicture: user?.profile_picture || null,
    };
  }, []);
}


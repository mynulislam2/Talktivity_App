import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';

export interface ChatIdentity {
  userId: number | null;
  fullName: string;
  profilePicture: string | null;
}

/**
 * Single source of truth for "current chat user" identity.
 * Uses Redux state for user data.
 */
export function useChatIdentity(): ChatIdentity {
  const user = useAppSelector(selectUser);

  return useMemo(() => {
    if (!user) {
      return {
        userId: null,
        fullName: 'You',
        profilePicture: null,
      };
    }

    return {
      userId: user.id ?? null,
      fullName: user.full_name || 'You',
      profilePicture: user.profile_picture || null,
    };
  }, [user]);
}

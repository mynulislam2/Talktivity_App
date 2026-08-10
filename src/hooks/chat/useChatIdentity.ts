import { useState, useEffect } from 'react';
import { authService } from '@/services/auth';

export interface ChatIdentity {
  userId: number | null;
  fullName: string;
  profilePicture: string | null;
}

export function useChatIdentity(): ChatIdentity {
  const [identity, setIdentity] = useState<ChatIdentity>({
    userId: null,
    fullName: 'You',
    profilePicture: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const user = await authService.getUser();
        if (!user) return;
        const rawUserId = (user as any).id;
        const normalizedUserId =
          typeof rawUserId === 'number'
            ? rawUserId
            : typeof rawUserId === 'string' && rawUserId.trim() !== ''
            ? Number(rawUserId)
            : null;

        setIdentity({
          userId: Number.isFinite(normalizedUserId) ? normalizedUserId : null,
          fullName: (user as any).full_name || (user as any).fullName || 'You',
          profilePicture:
            (user as any).profile_picture ||
            (user as any).profilePicture ||
            null,
        });
      } catch {}
    })();
  }, []);

  return identity;
}

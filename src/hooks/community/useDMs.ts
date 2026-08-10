import { hasUnreadDM as isUnreadDM } from '@/utils/community';
import { authService } from '@/services/auth';
import { getOnlineUsers, subscribeToPresence } from '@/services/socket';
import { useAppSelector } from '@/store/hooks';
import { selectDMs } from '@/store/slices/communitySlice';
import type { DM } from '@/types/community';
import { useCallback, useEffect, useState } from 'react';

export interface UseDMsReturn {
  dms: DM[];
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
}

export function useDMs(): UseDMsReturn {
  const dms = useAppSelector(selectDMs);
  const rawUser = authService.getUser() as any;
  const userId = rawUser?.id;
  const [onlineMap, setOnlineMap] = useState<
    Record<string, { online: boolean; lastSeen?: string }>
  >({});

  useEffect(() => {
    if (!userId || dms.length === 0) {
      setOnlineMap({});
      return;
    }

    const onlineUsers = getOnlineUsers();
    const map: Record<string, { online: boolean; lastSeen?: string }> = {};

    dms.forEach((dm) => {
      const idx = (dm.participant_ids || []).findIndex(
        (id: any) => String(id) !== String(userId)
      );
      if (idx !== -1) {
        const otherId = dm.participant_ids[idx];
        map[otherId] = {
          online: onlineUsers.has(otherId),
          lastSeen: undefined,
        };
      }
    });

    setOnlineMap(map);
  }, [dms, userId]);

  useEffect(() => {
    if (!userId) return;

    const handlePresence = (
      uid: number,
      online: boolean,
      lastSeen?: string
    ) => {
      setOnlineMap((prev) => ({ ...prev, [uid]: { online, lastSeen } }));
    };

    return subscribeToPresence(handlePresence);
  }, [userId]);

  const hasUnreadDM = useCallback((dm: DM): boolean => {
    return isUnreadDM(dm);
  }, []);

  const getOtherUser = useCallback(
    (dm: DM): { id: number; name: string; avatar?: string } => {
      if (!userId) return { id: 0, name: 'Unknown' };

      const idx = (dm.participant_ids || []).findIndex(
        (id: any) => String(id) !== String(userId)
      );
      return {
        id: dm.participant_ids[idx],
        name: dm.participant_names[idx],
        avatar: dm.participant_avatars?.[idx] || undefined,
      };
    },
    [userId]
  );

  return {
    dms,
    onlineMap,
    hasUnreadDM,
    getOtherUser,
  };
}

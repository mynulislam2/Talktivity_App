/**
 * useDMs Hook
 * 
 * Manages DM-specific state including presence tracking and unread detection.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectDMs } from '@/store/slices/communitySlice';
import { authService } from '@/service/AuthService';
import type { DM } from '@/types/community';

// SocketService imports - handle gracefully if not available
let getOnlineUsers: () => Set<number>;
let subscribeToPresence: (handler: (userId: number, online: boolean, lastSeen?: string) => void) => () => void;

try {
  const socketService = require('@/service/SocketService');
  getOnlineUsers = socketService.getOnlineUsers || (() => new Set<number>());
  subscribeToPresence = socketService.subscribeToPresence || (() => () => {});
} catch {
  getOnlineUsers = () => new Set<number>();
  subscribeToPresence = () => () => {};
}

export interface UseDMsReturn {
  dms: DM[];
  onlineMap: Record<string, { online: boolean; lastSeen?: string }>;
  hasUnreadDM: (dm: DM) => boolean;
  getOtherUser: (dm: DM) => { id: number; name: string; avatar?: string };
}

export function useDMs(): UseDMsReturn {
  const dms = useAppSelector(selectDMs);
  const userId = authService.getUser()?.id;
  const [onlineMap, setOnlineMap] = useState<Record<string, { online: boolean; lastSeen?: string }>>({});

  // Initialize online map from current DMs
  useEffect(() => {
    if (!userId || dms.length === 0) {
      setOnlineMap({});
      return;
    }

    const onlineUsers = getOnlineUsers();
    const map: Record<string, { online: boolean; lastSeen?: string }> = {};
    
    dms.forEach((dm) => {
      const idx = (dm.participant_ids || []).findIndex((id: any) => String(id) !== String(userId));
      if (idx !== -1) {
        const otherId = dm.participant_ids[idx];
        map[otherId] = { online: onlineUsers.has(otherId), lastSeen: undefined };
      }
    });
    
    setOnlineMap(map);
  }, [dms.length, userId]);

  // Subscribe to presence updates
  useEffect(() => {
    if (!userId) return;

    const handlePresence = (uid: number, online: boolean, lastSeen?: string) => {
      setOnlineMap((prev) => ({ ...prev, [uid]: { online, lastSeen } }));
    };

    subscribeToPresence(handlePresence);
  }, [userId]);

  const hasUnreadDM = useCallback((dm: DM): boolean => {
    if (!dm.last_message_time) return false;
    if (!dm.last_message_read) return true;
    return new Date(dm.last_message_read) < new Date(dm.last_message_time);
  }, []);

  const getOtherUser = useCallback((dm: DM): { id: number; name: string; avatar?: string } => {
    if (!userId) return { id: 0, name: 'Unknown' };
    
    const idx = (dm.participant_ids || []).findIndex((id: any) => String(id) !== String(userId));
    return {
      id: dm.participant_ids[idx],
      name: dm.participant_names[idx],
      avatar: dm.participant_avatars?.[idx] || undefined,
    };
  }, [userId]);

  return {
    dms,
    onlineMap,
    hasUnreadDM,
    getOtherUser,
  };
}

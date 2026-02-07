import { useEffect } from 'react';
import {
  connectSocket,
  joinDMRoom,
  leaveDMRoom,
  default as socket,
} from '@/service/SocketService';

export interface UseDMSocketOptions {
  dmId: number | null;
  userId: number | null;
  otherUserId: number | null;
  onMessage: (msg: any) => void;
  onTyping?: (payload: any) => void;
}

/**
 * Owns socket lifecycle for a DM room: connect, join, subscribe, cleanup.
 * UI/state updates happen via callbacks.
 */
export function useDMSocket({ dmId, userId, otherUserId, onMessage, onTyping }: UseDMSocketOptions) {
  useEffect(() => {
    if (!dmId || !userId || !otherUserId) return;

    connectSocket();
    joinDMRoom(userId, otherUserId);

    const handleDMMessage = (msg: any) => onMessage(msg);
    socket.on('dm_message', handleDMMessage);

    const handleTyping = (payload: any) => onTyping?.(payload);
    socket.on('dm_typing', handleTyping);

    return () => {
      leaveDMRoom(userId, otherUserId);
      socket.off('dm_message', handleDMMessage);
      socket.off('dm_typing', handleTyping);
    };
  }, [dmId, userId, otherUserId, onMessage, onTyping]);
}


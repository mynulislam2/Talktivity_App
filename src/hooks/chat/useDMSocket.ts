import { useEffect } from 'react';
import {
  connectSocket,
  joinDMRoom,
  leaveDMRoom,
  default as socket,
} from '@/services/socket';

export interface UseDMSocketOptions {
  dmId: number | null;
  userId: number | null;
  otherUserId: number | null;
  onMessage: (msg: any) => void;
  onTyping?: (payload: any) => void;
}

export function useDMSocket({
  dmId,
  userId,
  otherUserId,
  onMessage,
  onTyping,
}: UseDMSocketOptions) {
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

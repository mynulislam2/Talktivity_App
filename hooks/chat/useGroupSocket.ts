import { useEffect } from 'react';
import {
  connectSocket,
  joinGroupRoom,
  leaveGroupRoom,
  default as socket,
} from '@/service/SocketService';

export interface UseGroupSocketOptions {
  groupId: number | null;
  userId: number | null;
  onMessage: (msg: any) => void;
  onTyping?: (payload: any) => void;
}

/**
 * Owns socket lifecycle for a Group room: connect, join, subscribe, cleanup.
 * UI/state updates happen via callbacks.
 */
export function useGroupSocket({ groupId, userId, onMessage, onTyping }: UseGroupSocketOptions) {
  useEffect(() => {
    if (!groupId || !userId) return;

    connectSocket();
    joinGroupRoom(groupId, userId);

    const handleGroupMessage = (msg: any) => onMessage(msg);
    socket.on('group_message', handleGroupMessage);

    const handleTyping = (payload: any) => onTyping?.(payload);
    socket.on('group_typing', handleTyping);

    return () => {
      leaveGroupRoom(groupId, userId);
      socket.off('group_message', handleGroupMessage);
      socket.off('group_typing', handleTyping);
    };
  }, [groupId, userId, onMessage, onTyping]);
}


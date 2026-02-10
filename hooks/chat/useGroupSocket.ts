import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { groupMessageReceived, groupTypingUpdated } from '@/store/slices/chatSlice';

export interface UseGroupSocketOptions {
  groupId: number | null;
  userId: number | null;
  onMessage: (msg: any) => void;
  onTyping?: (payload: any) => void;
}

/**
 * Owns socket lifecycle for a group room: connect, join, subscribe, cleanup.
 * UI/state updates happen via callbacks and Redux.
 * 
 * TODO: Integrate with SocketService when available
 */
export function useGroupSocket({ groupId, userId, onMessage, onTyping }: UseGroupSocketOptions) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!groupId || !userId) return;

    // TODO: Connect socket and subscribe to events
    // For now, this is a placeholder
    // When SocketService is available:
    // - connectSocket();
    // - joinGroupRoom(groupId, userId);
    // - socket.on('group_message', handleGroupMessage);
    // - socket.on('group_typing', handleTyping);

    // Placeholder: Dispatch messages via callback
    // Real implementation will use socket events
    const handleGroupMessage = (msg: any) => {
      dispatch(groupMessageReceived({ groupId, message: msg }));
      onMessage(msg);
    };

    const handleTyping = (payload: any) => {
      dispatch(groupTypingUpdated({ groupId, userId: payload.userId, typing: payload.typing }));
      onTyping?.(payload);
    };

    return () => {
      // TODO: Cleanup socket listeners
      // leaveGroupRoom(groupId, userId);
      // socket.off('group_message', handleGroupMessage);
      // socket.off('group_typing', handleTyping);
    };
  }, [groupId, userId, onMessage, onTyping, dispatch]);
}

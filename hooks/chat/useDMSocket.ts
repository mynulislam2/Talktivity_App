import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { dmMessageReceived, dmTypingUpdated } from '@/store/slices/chatSlice';

export interface UseDMSocketOptions {
  dmId: number | null;
  userId: number | null;
  otherUserId: number | null;
  onMessage: (msg: any) => void;
  onTyping?: (payload: any) => void;
}

/**
 * Owns socket lifecycle for a DM room: connect, join, subscribe, cleanup.
 * UI/state updates happen via callbacks and Redux.
 * 
 * TODO: Integrate with SocketService when available
 */
export function useDMSocket({ dmId, userId, otherUserId, onMessage, onTyping }: UseDMSocketOptions) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!dmId || !userId || !otherUserId) return;

    // TODO: Connect socket and subscribe to events
    // For now, this is a placeholder
    // When SocketService is available:
    // - connectSocket();
    // - joinDMRoom(userId, otherUserId);
    // - socket.on('dm_message', handleDMMessage);
    // - socket.on('dm_typing', handleTyping);

    // Placeholder: Dispatch messages via callback
    // Real implementation will use socket events
    const handleDMMessage = (msg: any) => {
      dispatch(dmMessageReceived({ dmId, message: msg }));
      onMessage(msg);
    };

    const handleTyping = (payload: any) => {
      dispatch(dmTypingUpdated({ dmId, userId: payload.userId, typing: payload.typing }));
      onTyping?.(payload);
    };

    return () => {
      // TODO: Cleanup socket listeners
      // leaveDMRoom(userId, otherUserId);
      // socket.off('dm_message', handleDMMessage);
      // socket.off('dm_typing', handleTyping);
    };
  }, [dmId, userId, otherUserId, onMessage, onTyping, dispatch]);
}

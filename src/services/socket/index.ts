/**
 * Socket.IO Service
 *
 * Handles Socket.IO client connection, authentication, and event subscriptions.
 * Connects to the backend Socket.IO server for real-time communication.
 */

import { io, Socket } from 'socket.io-client';
import { authService } from '../auth';
import { normalizeUrl } from '@/lib/network/urlNormalizer';

// Get WebSocket server URL
const getSocketURL = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

  const fixLocalhost = (url: string) => {
    return normalizeUrl(url);
  };

  if (
    !envUrl ||
    envUrl === 'null' ||
    envUrl === 'undefined' ||
    String(envUrl).trim() === ''
  ) {
    // Use localhost so normalizeUrl can map it correctly for emulator/real device
    const defaultUrl = 'http://localhost:8082';
    return fixLocalhost(defaultUrl);
  }

  const cleanUrl = fixLocalhost(String(envUrl).replace(/\/$/, '').trim());
  // Remove /api if present (Socket.IO runs on root)
  return cleanUrl.replace(/\/api$/, '');
};

// Socket instance (singleton)
let socketInstance: Socket | null = null;

/**
 * Session state payload interface
 */
export interface SessionStatePayload {
  state: 'SAVING_CONVERSATION' | 'SESSION_SAVED' | 'SESSION_SAVE_FAILED';
  message?: string;
  call_id?: string;
}

/**
 * Connect to Socket.IO server
 */
export async function connectSocket(): Promise<Socket> {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const token = await authService.getToken();
  if (!token) {
    throw new Error('Authentication required to connect socket');
  }

  const serverURL = getSocketURL();

  socketInstance = io(serverURL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socketInstance.on('connect', () => {});
  socketInstance.on('disconnect', () => {});
  socketInstance.on('reconnect', () => {});
  socketInstance.on('connect_error', () => {});
  socketInstance.on('error', () => {});

  return socketInstance;
}

/**
 * Subscribe to session state events
 * Waits for connection if not connected. Socket.IO maintains listeners across reconnections.
 * @param handler - Callback function to handle session state events
 * @returns Unsubscribe function
 */
export function subscribeToSessionState(
  handler: (payload: SessionStatePayload) => void
): () => void {
  // Ensure socket is initialized and connecting
  if (!socketInstance) {
    // Start connection without waiting
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot subscribe to session_state: Socket not initialized
    return () => {}; // Return no-op unsubscribe
  }

  // Subscribe immediately if connected, otherwise wait for connection
  // Socket.IO maintains event listeners across reconnections automatically
  if (socketInstance.connected) {
    // Socket already connected, subscribing to session_state
    socketInstance.on('session_state', handler);
  } else {
    // Socket not connected, waiting for connection before subscribing
    // Wait for connection (Socket.IO will maintain this listener across reconnections)
    socketInstance.once('connect', () => {
      // Socket connected, subscribing to session_state
      socketInstance?.on('session_state', handler);
    });
  }

  // Return unsubscribe function
  return () => {
    if (socketInstance) {
      // Unsubscribing from session_state event
      socketInstance.off('session_state', handler);
    }
  };
}

/**
 * Coaching nudge payload interface
 */
export interface CoachingNudgePayload {
  kind?: string;
  message: string;
  nudge_index?: number;
  call_id?: string;
  today_seconds?: number;
}

/**
 * Subscribe to coaching nudge events
 */
export function subscribeToCoachingNudge(
  handler: (payload: CoachingNudgePayload) => void
): () => void {
  if (!socketInstance) {
    connectSocket().catch(() => {});
  }

  if (!socketInstance) {
    return () => {};
  }

  if (socketInstance.connected) {
    socketInstance.on('coaching_nudge', handler);
  } else {
    socketInstance.once('connect', () => {
      socketInstance!.on('coaching_nudge', handler);
    });
  }

  return () => {
    if (socketInstance) {
      socketInstance.off('coaching_nudge', handler);
    }
  };
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// Lazy connection trigger
const ensureConnected = (): void => {
  if (!socketInstance) {
    connectSocket().catch(() => {});
  }
};

const socket = {
  get connected() {
    if (!socketInstance) return false;
    return socketInstance.connected;
  },
  get id() {
    if (!socketInstance) return undefined;
    return socketInstance.id;
  },
  on: (event: string, callback: (...args: any[]) => void) => {
    ensureConnected();
    if (!socketInstance) return socket as any;
    socketInstance.on(event, callback);
    return socket;
  },
  off: (event: string, callback?: (...args: any[]) => void) => {
    ensureConnected();
    if (!socketInstance) return socket as any;
    socketInstance.off(event, callback);
    return socket;
  },
  emit: (event: string, ...args: any[]) => {
    ensureConnected();
    if (!socketInstance) return socket as any;
    socketInstance.emit(event, ...args);
    return socket;
  },
  disconnect: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  },
} as unknown as Socket;

/**
 * Online users tracking
 */
const onlineUsers = new Set<number>();

/**
 * Get set of currently online user IDs
 */
export function getOnlineUsers(): Set<number> {
  return new Set(onlineUsers);
}

/**
 * Subscribe to presence updates
 * @param handler - Callback function (userId, online, lastSeen?)
 */
export function subscribeToPresence(
  handler: (userId: number, online: boolean, lastSeen?: string) => void
): () => void {
  // Ensure socket is initialized and connecting
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot subscribe to presence: Socket not initialized
    return () => {}; // Return no-op unsubscribe
  }

  // Subscribe to presence events
  const presenceHandler = (data: {
    userId: number;
    online: boolean;
    lastSeen?: string;
  }) => {
    if (data.online) {
      onlineUsers.add(data.userId);
    } else {
      onlineUsers.delete(data.userId);
    }
    handler(data.userId, data.online, data.lastSeen);
  };

  // Subscribe immediately if connected, otherwise wait for connection
  if (socketInstance.connected) {
    socketInstance.on('presence', presenceHandler);
  } else {
    socketInstance.once('connect', () => {
      socketInstance?.on('presence', presenceHandler);
    });
  }

  // Return unsubscribe function
  return () => {
    if (socketInstance) {
      socketInstance.off('presence', presenceHandler);
    }
  };
}

/**
 * Join a group room for real-time group chat
 */
export function joinGroupRoom(groupId: number, userId: number): void {
  // Ensure socket is initialized and connecting
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot join group room: Socket not initialized
    return;
  }

  socketInstance.emit('join_group', { groupId, userId });
}

/**
 * Leave a group room
 */
export function leaveGroupRoom(groupId: number, userId: number): void {
  if (!socketInstance) {
    // Nothing to do
    return;
  }

  socketInstance.emit('leave_group', { groupId, userId });
}

/**
 * Send a group message
 */
export function sendGroupMessage(groupId: number, content: string): void {
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot send group message: Socket not initialized
    return;
  }

  socketInstance.emit('group_message', { groupId, content });
}

/**
 * Emit group typing indicator
 */
export function groupTyping(
  groupId: number,
  userId: number,
  typing: boolean
): void {
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot emit group typing: Socket not initialized
    return;
  }

  socketInstance.emit('group_typing', { groupId, typing });
}

/**
 * Join a DM room for real-time direct messages
 */
export function joinDMRoom(userId: number, otherUserId: number): void {
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot join DM room: Socket not initialized
    return;
  }

  socketInstance.emit('join_dm', { otherUserId });
}

/**
 * Leave a DM room
 */
export function leaveDMRoom(userId: number, otherUserId: number): void {
  if (!socketInstance) {
    return;
  }

  socketInstance.emit('leave_dm', { otherUserId });
}

/**
 * Send a DM message
 */
export function sendDMMessage(
  dmId: number,
  senderId: number,
  receiverId: number,
  content: string
): void {
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot send DM message: Socket not initialized
    return;
  }

  socketInstance.emit('dm_message', { dmId, receiverId, content });
}

/**
 * Emit DM typing indicator
 */
export function dmTyping(
  userId: number,
  otherUserId: number,
  typing: boolean
): void {
  if (!socketInstance) {
    connectSocket().catch((err) => {
      console.error('Γ¥î [SocketService] Failed to connect socket:', err);
    });
  }

  if (!socketInstance) {
    // Cannot emit DM typing: Socket not initialized
    return;
  }

  socketInstance.emit('dm_typing', { otherUserId, typing });
}

export default socket;

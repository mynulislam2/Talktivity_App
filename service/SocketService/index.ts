/**
 * Socket.IO Service
 * 
 * Handles Socket.IO client connection, authentication, and event subscriptions.
 * Connects to the backend Socket.IO server for real-time communication.
 */

import { io, Socket } from 'socket.io-client';
import { authService } from '../AuthService';

// Get WebSocket server URL
const getSocketURL = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:8082';
  }
  
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || envUrl === 'null' || envUrl === 'undefined' || String(envUrl).trim() === '') {
    return 'http://localhost:8082';
  }
  
  const cleanUrl = String(envUrl).replace(/\/$/, '').trim();
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
export function connectSocket(): Socket {
  // Return existing connection if available and connected
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // Get authentication token
  const token = authService.getToken();
  if (!token) {
    // Socket connection: No authentication token found
    throw new Error('Authentication required to connect socket');
  }

  // Get server URL
  const serverURL = getSocketURL();
  
  // Connecting to Socket.IO server

  // Create socket connection
  socketInstance = io(serverURL, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Connection event handlers
  socketInstance.on('connect', () => {
    // Socket.IO connected
  });

  socketInstance.on('disconnect', (reason) => {
    // Socket.IO disconnected
  });

  socketInstance.on('reconnect', (attemptNumber) => {
    // Socket.IO reconnected
  });

  socketInstance.on('connect_error', (error) => {
    // Socket.IO connection error
  });

  socketInstance.on('error', (error: any) => {
    // Socket.IO error
  });

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
  // Ensure socket is initialized
  if (!socketInstance) {
    connectSocket();
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
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

// Get socket instance (lazy connection)
// This ensures socket is connected when accessed
const getSocket = (): Socket => {
  if (!socketInstance || !socketInstance.connected) {
    return connectSocket();
  }
  return socketInstance;
};

// Default export: socket instance getter
// Access via: socket.connected, socket.on(), etc.
// The socket will be connected automatically on first access
const socket = {
  get connected() {
    return getSocket().connected;
  },
  get id() {
    return getSocket().id;
  },
  on: (event: string, callback: (...args: any[]) => void) => {
    return getSocket().on(event, callback);
  },
  off: (event: string, callback?: (...args: any[]) => void) => {
    return getSocket().off(event, callback);
  },
  emit: (event: string, ...args: any[]) => {
    return getSocket().emit(event, ...args);
  },
  disconnect: () => {
    return getSocket().disconnect();
  },
} as Socket;

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
  // Ensure socket is initialized
  if (!socketInstance) {
    connectSocket();
  }

  if (!socketInstance) {
    // Cannot subscribe to presence: Socket not initialized
    return () => {}; // Return no-op unsubscribe
  }

  // Subscribe to presence events
  const presenceHandler = (data: { userId: number; online: boolean; lastSeen?: string }) => {
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
  // Ensure socket is initialized
  if (!socketInstance) {
    connectSocket();
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
    connectSocket();
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
export function groupTyping(groupId: number, userId: number, typing: boolean): void {
  if (!socketInstance) {
    connectSocket();
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
    connectSocket();
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
export function sendDMMessage(dmId: number, senderId: number, receiverId: number, content: string): void {
  if (!socketInstance) {
    connectSocket();
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
export function dmTyping(userId: number, otherUserId: number, typing: boolean): void {
  if (!socketInstance) {
    connectSocket();
  }

  if (!socketInstance) {
    // Cannot emit DM typing: Socket not initialized
    return;
  }

  socketInstance.emit('dm_typing', { otherUserId, typing });
}

export default socket;

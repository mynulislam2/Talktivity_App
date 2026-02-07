/**
 * useChat Hook
 * 
 * Manages chat functionality:
 * - Loading messages
 * - Sending messages
 * - Real-time message updates
 * - User status
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { dmsService } from '../service/DmsService';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface UseChatsState {
  messages: ChatMessage[];
  currentUser: ChatUser | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export const useChat = (userId: string) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: RootState) => state.profile?.id);
  
  const [state, setState] = useState<UseChatsState>({
    messages: [],
    currentUser: null,
    isLoading: true,
    isSending: false,
    error: null,
  });

  // Load messages and user info
  useEffect(() => {
    loadChatData();
  }, [userId]);

  const loadChatData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // TODO: Call dmsService.getMessages(userId) when backend is ready
      const messages: ChatMessage[] = [];
      
      // TODO: Call dmsService.getUser(userId) when backend is ready
      const currentUser: ChatUser = {
        id: userId,
        name: 'User name',
        isOnline: true,
      };

      setState((prev) => ({
        ...prev,
        messages,
        currentUser,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to load chat',
        isLoading: false,
      }));
    }
  }, [userId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setState((prev) => ({ ...prev, isSending: true, error: null }));
      try {
        // TODO: Call dmsService.sendMessage(userId, content) when backend is ready
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: currentUserId || '',
          userName: 'You',
          content,
          timestamp: new Date().toISOString(),
          isOwn: true,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          isSending: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to send message',
          isSending: false,
        }));
      }
    },
    [userId, currentUserId]
  );

  return {
    ...state,
    sendMessage,
    loadChatData,
  };
};

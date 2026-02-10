/**
 * Chat Slice (hybrid)
 *
 * Owns realtime socket-ingested state (messages + typing) for DM and Group chats.
 * Server-fetched lists/messages remain in `communitySlice` for now.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

interface ChatState {
  dmRealtimeMessages: Record<number, any[]>;
  groupRealtimeMessages: Record<number, any[]>;
  dmTypingUser: Record<number, number | null>;
  groupTypingUsers: Record<number, number[]>; // store as array for serializability
}

const initialState: ChatState = {
  dmRealtimeMessages: {},
  groupRealtimeMessages: {},
  dmTypingUser: {},
  groupTypingUsers: {},
};

function upsertMessage(list: any[], msg: any): any[] {
  const id = msg?.id != null ? String(msg.id) : '';
  if (!id) return [...list, msg];
  const idx = list.findIndex((m) => String(m?.id) === id);
  if (idx === -1) return [...list, msg];
  const next = list.slice();
  next[idx] = { ...next[idx], ...msg };
  return next;
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    dmMessageReceived: (state, action: PayloadAction<{ dmId: number; message: any }>) => {
      const { dmId, message } = action.payload;
      const prev = state.dmRealtimeMessages[dmId] || [];
      state.dmRealtimeMessages[dmId] = upsertMessage(prev, message);
    },
    groupMessageReceived: (state, action: PayloadAction<{ groupId: number; message: any }>) => {
      const { groupId, message } = action.payload;
      const prev = state.groupRealtimeMessages[groupId] || [];
      state.groupRealtimeMessages[groupId] = upsertMessage(prev, message);
    },
    dmTypingUpdated: (state, action: PayloadAction<{ dmId: number; userId: number; typing: boolean }>) => {
      const { dmId, userId, typing } = action.payload;
      state.dmTypingUser[dmId] = typing ? userId : null;
    },
    groupTypingUpdated: (state, action: PayloadAction<{ groupId: number; userId: number; typing: boolean }>) => {
      const { groupId, userId, typing } = action.payload;
      const prev = state.groupTypingUsers[groupId] || [];
      const set = new Set(prev);
      if (typing) set.add(userId);
      else set.delete(userId);
      state.groupTypingUsers[groupId] = Array.from(set);
    },
    clearDMThreadRealtime: (state, action: PayloadAction<{ dmId: number }>) => {
      delete state.dmRealtimeMessages[action.payload.dmId];
      delete state.dmTypingUser[action.payload.dmId];
    },
    clearGroupThreadRealtime: (state, action: PayloadAction<{ groupId: number }>) => {
      delete state.groupRealtimeMessages[action.payload.groupId];
      delete state.groupTypingUsers[action.payload.groupId];
    },
    resetChat: (state) => {
      state.dmRealtimeMessages = {};
      state.groupRealtimeMessages = {};
      state.dmTypingUser = {};
      state.groupTypingUsers = {};
    },
  },
});

export const {
  dmMessageReceived,
  groupMessageReceived,
  dmTypingUpdated,
  groupTypingUpdated,
  clearDMThreadRealtime,
  clearGroupThreadRealtime,
  resetChat,
} = chatSlice.actions;

// Memoized selectors to prevent unnecessary re-renders
const selectDMRealtimeMessagesMap = (state: RootState) => state.chat.dmRealtimeMessages;
const selectGroupRealtimeMessagesMap = (state: RootState) => state.chat.groupRealtimeMessages;
const selectDMTypingUserMap = (state: RootState) => state.chat.dmTypingUser;
const selectGroupTypingUsersMap = (state: RootState) => state.chat.groupTypingUsers;

// Empty array constant to reuse (same reference)
const EMPTY_ARRAY: any[] = [];

export const selectRealtimeDMMessages = (dmId: number) => 
  createSelector(
    [selectDMRealtimeMessagesMap],
    (messagesMap) => messagesMap[dmId] || EMPTY_ARRAY
  );

export const selectRealtimeGroupMessages = (groupId: number) => 
  createSelector(
    [selectGroupRealtimeMessagesMap],
    (messagesMap) => messagesMap[groupId] || EMPTY_ARRAY
  );

export const selectDMTypingUser = (dmId: number) => 
  createSelector(
    [selectDMTypingUserMap],
    (typingMap) => typingMap[dmId] ?? null
  );

export const selectGroupTypingUsers = (groupId: number) => 
  createSelector(
    [selectGroupTypingUsersMap],
    (typingMap) => typingMap[groupId] || EMPTY_ARRAY
  );

export default chatSlice.reducer;


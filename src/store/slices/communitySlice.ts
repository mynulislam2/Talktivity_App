/**
 * Redux Toolkit Community Slice
 *
 * Manages global community state including DMs, Groups, joined groups,
 * and last read status.
 */

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  createSelector,
} from '@reduxjs/toolkit';
import { communityService } from '@/services/community';
import type {
  DM,
  DMMessage,
  Group,
  GroupMember,
  GroupMessage,
  LastReadStatus,
} from '@/types/community';

/**
 * Community state interface
 */
interface CommunityState {
  dms: DM[];
  groups: Group[];
  joinedGroups: number[]; // IDs of joined groups
  lastRead: Record<string, string>; // groupId -> lastRead timestamp
  dmMessages: Record<number, DMMessage[]>; // dmId -> messages
  groupMessages: Record<number, GroupMessage[]>; // groupId -> messages
  groupMembers: Record<number, GroupMember[]>; // groupId -> members
  loading: boolean;
  error: string | null;
  dmLoading: boolean;
  groupsLoading: boolean;
  messagesLoading: Record<number, boolean>; // dmId/groupId -> loading state
  membersLoading: Record<number, boolean>; // groupId -> loading state
}

/**
 * Initial state
 */
const initialState: CommunityState = {
  dms: [],
  groups: [],
  joinedGroups: [],
  lastRead: {},
  dmMessages: {},
  groupMessages: {},
  groupMembers: {},
  loading: false,
  error: null,
  dmLoading: false,
  groupsLoading: false,
  messagesLoading: {},
  membersLoading: {},
};

/**
 * Async thunk: Load DMs
 */
export const loadDMs = createAsyncThunk(
  'community/loadDMs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.getDMs();
      if (response.success && response.data) {
        return response.data.dms;
      }
      return rejectWithValue(response.error || 'Failed to load DMs');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load DMs');
    }
  }
);

/**
 * Async thunk: Load groups
 */
export const loadGroups = createAsyncThunk(
  'community/loadGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.getGroups();
      if (response.success && response.data) {
        return response.data.groups;
      }
      return rejectWithValue(response.error || 'Failed to load groups');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load groups');
    }
  }
);

/**
 * Async thunk: Load joined groups
 */
export const loadJoinedGroups = createAsyncThunk(
  'community/loadJoinedGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.getJoinedGroups();
      if (response.success && response.data) {
        return response.data.joinedGroups.map((g: Group) => g.id);
      }
      return rejectWithValue(response.error || 'Failed to load joined groups');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load joined groups');
    }
  }
);

/**
 * Async thunk: Load last read status
 */
export const loadLastReadStatus = createAsyncThunk(
  'community/loadLastReadStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.getLastReadStatus();
      if (response.success && response.data) {
        const lastReadMap: Record<string, string> = {};
        response.data.lastRead.forEach((item: LastReadStatus) => {
          lastReadMap[String(item.group_id)] = item.last_read_at;
        });
        return lastReadMap;
      }
      return rejectWithValue(
        response.error || 'Failed to load last read status'
      );
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to load last read status'
      );
    }
  }
);

/**
 * Async thunk: Join group
 */
export const joinGroup = createAsyncThunk(
  'community/joinGroup',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await communityService.joinGroup(groupId);
      if (response.success) {
        return groupId;
      }
      return rejectWithValue(response.error || 'Failed to join group');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to join group');
    }
  }
);

/**
 * Async thunk: Leave group
 */
export const leaveGroup = createAsyncThunk(
  'community/leaveGroup',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await communityService.leaveGroup(groupId);
      if (response.success) {
        return groupId;
      }
      return rejectWithValue(response.error || 'Failed to leave group');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to leave group');
    }
  }
);

/**
 * Async thunk: Load DM messages
 */
export const loadDMMessages = createAsyncThunk(
  'community/loadDMMessages',
  async (dmId: number, { rejectWithValue }) => {
    try {
      const response = await communityService.getDMMessages(String(dmId));
      if (response.success && response.data) {
        return { dmId, messages: response.data.messages };
      }
      return rejectWithValue(response.error || 'Failed to load DM messages');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load DM messages');
    }
  }
);

/**
 * Async thunk: Load group messages
 */
export const loadGroupMessages = createAsyncThunk(
  'community/loadGroupMessages',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await communityService.getGroupMessages(groupId);
      if (response.success && response.data) {
        return { groupId, messages: response.data.messages };
      }
      return rejectWithValue(response.error || 'Failed to load group messages');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load group messages');
    }
  }
);

/**
 * Async thunk: Send DM message
 */
export const sendDMMessage = createAsyncThunk(
  'community/sendDMMessage',
  async (
    { dmId, content }: { dmId: number; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await communityService.sendDMMessage(dmId, { content });
      if (response.success && response.data) {
        return { dmId, message: response.data.message };
      }
      return rejectWithValue(response.error || 'Failed to send message');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

/**
 * Async thunk: Load group members
 */
export const loadGroupMembers = createAsyncThunk(
  'community/loadGroupMembers',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await communityService.getGroupMembers(groupId);
      if (response.success && response.data) {
        return {
          groupId,
          members: response.data.members,
          memberCount: response.data.member_count,
        };
      }
      return rejectWithValue(response.error || 'Failed to load group members');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load group members');
    }
  }
);

/**
 * Async thunk: Send group message
 */
export const sendGroupMessage = createAsyncThunk(
  'community/sendGroupMessage',
  async (
    { groupId, content }: { groupId: number; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await communityService.sendGroupMessage(groupId, {
        content,
      });
      if (response.success && response.data) {
        return { groupId, message: response.data.message };
      }
      return rejectWithValue(response.error || 'Failed to send message');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

/**
 * Community slice
 */
const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    resetCommunity: (state) => {
      state.dms = [];
      state.groups = [];
      state.joinedGroups = [];
      state.lastRead = {};
      state.dmMessages = {};
      state.groupMessages = {};
      state.groupMembers = {};
      state.loading = false;
      state.error = null;
      state.dmLoading = false;
      state.groupsLoading = false;
      state.messagesLoading = {};
      state.membersLoading = {};
    },
    /**
     * Mark a DM as read locally
     */
    markDMReadLocally: (
      state,
      action: PayloadAction<{ dmId: number; readAt: string }>
    ) => {
      const { dmId, readAt } = action.payload;
      const key = `dm_${dmId}`;
      state.lastRead[key] = readAt;
    },
    /**
     * Mark a Group as read locally
     */
    markGroupReadLocally: (
      state,
      action: PayloadAction<{ groupId: number; readAt: string }>
    ) => {
      const { groupId, readAt } = action.payload;
      const key = `group_${groupId}`;
      state.lastRead[key] = readAt;
    },
    /**
     * Sync DM preview after sending own message
     */
    syncDMPreviewAfterOwnMessage: (
      state,
      action: PayloadAction<{
        dmId: number;
        content: string;
        createdAt: string;
      }>
    ) => {
      const { dmId, content, createdAt } = action.payload;
      const dm = state.dms.find((d) => d.id === dmId);
      if (dm) {
        dm.last_message = content;
        dm.last_message_time = createdAt;
      }
    },
    /**
     * Sync Group preview after sending own message
     */
    syncGroupPreviewAfterOwnMessage: (
      state,
      action: PayloadAction<{
        groupId: number;
        content: string;
        createdAt: string;
        senderName: string;
      }>
    ) => {
      const { groupId, content, createdAt, senderName } = action.payload;
      const group = state.groups.find((g) => g.id === groupId);
      if (group) {
        (group as any).last_message = content;
        (group as any).last_message_time = createdAt;
        (group as any).last_message_sender_name = senderName;
      }
    },
  },
  extraReducers: (builder) => {
    // Load DMs
    builder
      .addCase(loadDMs.pending, (state) => {
        state.dmLoading = true;
        state.error = null;
      })
      .addCase(loadDMs.fulfilled, (state, action) => {
        state.dms = action.payload;
        state.dmLoading = false;
      })
      .addCase(loadDMs.rejected, (state, action) => {
        state.dmLoading = false;
        state.error = action.payload as string;
      });

    // Load groups
    builder
      .addCase(loadGroups.pending, (state) => {
        state.groupsLoading = true;
        state.error = null;
      })
      .addCase(loadGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
        state.groupsLoading = false;
      })
      .addCase(loadGroups.rejected, (state, action) => {
        state.groupsLoading = false;
        state.error = action.payload as string;
      });

    // Load joined groups
    builder.addCase(loadJoinedGroups.fulfilled, (state, action) => {
      state.joinedGroups = action.payload;
    });

    // Load last read status
    builder.addCase(loadLastReadStatus.fulfilled, (state, action) => {
      state.lastRead = action.payload;
    });

    // Join group
    builder.addCase(joinGroup.fulfilled, (state, action) => {
      if (!state.joinedGroups.includes(action.payload)) {
        state.joinedGroups.push(action.payload);
      }
    });

    // Leave group
    builder.addCase(leaveGroup.fulfilled, (state, action) => {
      state.joinedGroups = state.joinedGroups.filter(
        (id) => id !== action.payload
      );
    });

    // Load DM messages
    builder
      .addCase(loadDMMessages.pending, (state, action) => {
        state.messagesLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(loadDMMessages.fulfilled, (state, action) => {
        state.dmMessages[action.payload.dmId] = action.payload.messages;
        state.messagesLoading[action.payload.dmId] = false;
      })
      .addCase(loadDMMessages.rejected, (state, action) => {
        state.messagesLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      });

    // Send DM message
    builder
      .addCase(sendDMMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendDMMessage.fulfilled, (state, action) => {
        const { dmId, message } = action.payload;
        if (!state.dmMessages[dmId]) {
          state.dmMessages[dmId] = [];
        }
        state.dmMessages[dmId].push(message);
      })
      .addCase(sendDMMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Load group messages
    builder
      .addCase(loadGroupMessages.pending, (state, action) => {
        state.messagesLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(loadGroupMessages.fulfilled, (state, action) => {
        state.groupMessages[action.payload.groupId] = action.payload.messages;
        state.messagesLoading[action.payload.groupId] = false;
      })
      .addCase(loadGroupMessages.rejected, (state, action) => {
        state.messagesLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      });

    // Load group members
    builder
      .addCase(loadGroupMembers.pending, (state, action) => {
        state.membersLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(loadGroupMembers.fulfilled, (state, action) => {
        state.groupMembers[action.payload.groupId] = action.payload.members;
        // Update group member count if group exists
        const group = state.groups.find((g) => g.id === action.payload.groupId);
        if (group) {
          group.member_count = action.payload.memberCount;
        }
        state.membersLoading[action.payload.groupId] = false;
      })
      .addCase(loadGroupMembers.rejected, (state, action) => {
        state.membersLoading[action.meta.arg] = false;
        state.error = action.payload as string;
      });

    // Send group message
    builder
      .addCase(sendGroupMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendGroupMessage.fulfilled, (state, action) => {
        const { groupId, message } = action.payload;
        if (!state.groupMessages[groupId]) {
          state.groupMessages[groupId] = [];
        }
        state.groupMessages[groupId].push(message);
      })
      .addCase(sendGroupMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  resetCommunity,
  markDMReadLocally,
  markGroupReadLocally,
  syncDMPreviewAfterOwnMessage,
  syncGroupPreviewAfterOwnMessage,
} = communitySlice.actions;

/**
 * Selectors
 */
export const selectDMs = (state: { community: CommunityState }) =>
  state.community.dms;
export const selectGroups = (state: { community: CommunityState }) =>
  state.community.groups;
export const selectJoinedGroups = (state: { community: CommunityState }) =>
  state.community.joinedGroups;
export const selectLastRead = (state: { community: CommunityState }) =>
  state.community.lastRead;
export const selectCommunityLoading = (state: { community: CommunityState }) =>
  state.community.loading ||
  state.community.dmLoading ||
  state.community.groupsLoading;
export const selectCommunityError = (state: { community: CommunityState }) =>
  state.community.error;
export const selectDMLoading = (state: { community: CommunityState }) =>
  state.community.dmLoading;
export const selectGroupsLoading = (state: { community: CommunityState }) =>
  state.community.groupsLoading;

/**
 * Selectors for messages and members
 * Using createSelector to memoize and prevent unnecessary re-renders
 */
const selectDMMessagesMap = (state: { community: CommunityState }) =>
  state.community.dmMessages;
const selectGroupMessagesMap = (state: { community: CommunityState }) =>
  state.community.groupMessages;
const selectGroupMembersMap = (state: { community: CommunityState }) =>
  state.community.groupMembers;
const selectMessagesLoadingMap = (state: { community: CommunityState }) =>
  state.community.messagesLoading;
const selectMembersLoadingMap = (state: { community: CommunityState }) =>
  state.community.membersLoading;

// Empty array constant to reuse (same reference)
const EMPTY_ARRAY: any[] = [];

export const selectDMMessages = (dmId: number) =>
  createSelector(
    [selectDMMessagesMap],
    (messagesMap) => messagesMap[dmId] || EMPTY_ARRAY
  );

export const selectGroupMessages = (groupId: number) =>
  createSelector(
    [selectGroupMessagesMap],
    (messagesMap) => messagesMap[groupId] || EMPTY_ARRAY
  );

export const selectGroupMembers = (groupId: number) =>
  createSelector(
    [selectGroupMembersMap],
    (membersMap) => membersMap[groupId] || EMPTY_ARRAY
  );

export const selectMessagesLoading = (id: number) =>
  createSelector(
    [selectMessagesLoadingMap],
    (loadingMap) => loadingMap[id] || false
  );

export const selectMembersLoading = (groupId: number) =>
  createSelector(
    [selectMembersLoadingMap],
    (loadingMap) => loadingMap[groupId] || false
  );

/**
 * Computed selectors
 */
export const selectUnreadDMsCount = (state: { community: CommunityState }) => {
  const dms = state.community.dms;
  return dms.filter((dm) => {
    if (!dm.last_message_time) return false;
    if (!dm.last_message_read) return true;
    return new Date(dm.last_message_read) < new Date(dm.last_message_time);
  }).length;
};

export const selectUnreadGroupsCount = (state: {
  community: CommunityState;
}) => {
  const groups = state.community.groups;
  const lastRead = state.community.lastRead;
  return groups.filter((group) => {
    const lastReadAt = lastRead[String(group.id)];
    const lastMsgAt =
      group.last_message_at || group.updated_at || group.created_at;
    if (!lastMsgAt) return false;
    if (!lastReadAt) return true;
    return new Date(lastReadAt) < new Date(lastMsgAt);
  }).length;
};

export default communitySlice.reducer;

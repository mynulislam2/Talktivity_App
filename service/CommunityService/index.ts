/**
 * Community Service
 * 
 * Service for managing DMs and Groups API calls.
 * Handles fetching DMs, groups, joining/leaving groups, and related operations.
 */

import { httpService } from '../httpservice';
import type { DM, DMMessage, Group, GroupMember, GroupMessage, LastReadStatus } from '@/types/community';

export interface GetDMsResponse {
  success: boolean;
  data?: { dms: DM[] };
  error?: string;
  message?: string;
}

export interface GetGroupsResponse {
  success: boolean;
  data?: { groups: Group[] };
  error?: string;
  message?: string;
}

export interface GetJoinedGroupsResponse {
  success: boolean;
  data?: { joinedGroups: Group[] };
  error?: string;
  message?: string;
}

export interface GetLastReadResponse {
  success: boolean;
  data?: { lastRead: LastReadStatus[] };
  error?: string;
  message?: string;
}

export interface GetDMMessagesResponse {
  success: boolean;
  data?: { messages: DMMessage[] };
  error?: string;
  message?: string;
}

export interface GetGroupMembersResponse {
  success: boolean;
  data?: { members: GroupMember[]; member_count: number };
  error?: string;
  message?: string;
}

export interface GetGroupMessagesResponse {
  success: boolean;
  data?: { messages: GroupMessage[] };
  error?: string;
  message?: string;
}

class CommunityService {
  private static instance: CommunityService;
  private constructor() {}

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * Get all DM conversations for the current user
   */
  async getDMs(): Promise<GetDMsResponse> {
    try {
      const response = await httpService.get('/dms');
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { dms: response.data.data.dms || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch DMs');
    } catch (error: any) {
      // Error in CommunityService.getDMs
      return {
        success: false,
        data: { dms: [] },
        error: error.response?.data?.error || error.message || 'Failed to load DMs',
      };
    }
  }

  /**
   * Start a new DM conversation
   */
  async startDM(otherUserId: number): Promise<{ success: boolean; data?: { dmId: number }; error?: string }> {
    try {
      const response = await httpService.post('/dms/start', { otherUserId });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { dmId: response.data.data.dmId },
        };
      }
      throw new Error(response.data?.error || 'Failed to start DM');
    } catch (error: any) {
      // Error in CommunityService.startDM:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to start DM',
      };
    }
  }

  /**
   * Get messages from a DM conversation
   */
  async getDMMessages(dmId: string, page: number = 1, pageSize: number = 30): Promise<GetDMMessagesResponse> {
    try {
      const response = await httpService.get(`/dms/${dmId}/messages`, {
        params: { page, pageSize },
      });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { messages: response.data.data.messages || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch DM messages');
    } catch (error: any) {
      // Error in CommunityService.getDMMessages:', error);
      return {
        success: false,
        data: { messages: [] },
        error: error.response?.data?.error || error.message || 'Failed to load messages',
      };
    }
  }

  /**
   * Mark a DM conversation as read
   */
  async markDMAsRead(dmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/dms/${dmId}/read`);
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to mark DM as read');
    } catch (error: any) {
      // Error in CommunityService.markDMAsRead:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to mark as read',
      };
    }
  }

  /**
   * Archive a DM conversation
   */
  async archiveDM(dmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/dms/${dmId}/archive`);
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to archive DM');
    } catch (error: any) {
      // Error in CommunityService.archiveDM:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to archive DM',
      };
    }
  }

  /**
   * Get all groups with optional filters
   */
  async getGroups(search?: string, category?: string): Promise<GetGroupsResponse> {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await httpService.get('/groups', { params });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { groups: response.data.data.groups || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch groups');
    } catch (error: any) {
      // Error in CommunityService.getGroups:', error);
      return {
        success: false,
        data: { groups: [] },
        error: error.response?.data?.error || error.message || 'Failed to load groups',
      };
    }
  }

  /**
   * Get groups the user has joined
   */
  async getJoinedGroups(): Promise<GetJoinedGroupsResponse> {
    try {
      const response = await httpService.get('/groups/joined');
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { joinedGroups: response.data.data.joinedGroups || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch joined groups');
    } catch (error: any) {
      // Error in CommunityService.getJoinedGroups:', error);
      return {
        success: false,
        data: { joinedGroups: [] },
        error: error.response?.data?.error || error.message || 'Failed to load joined groups',
      };
    }
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/groups/${groupId}/join`);
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to join group');
    } catch (error: any) {
      // Error in CommunityService.joinGroup:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to join group',
      };
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/groups/${groupId}/leave`);
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to leave group');
    } catch (error: any) {
      // Error in CommunityService.leaveGroup:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to leave group',
      };
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: number): Promise<GetGroupMembersResponse> {
    try {
      const response = await httpService.get(`/groups/${groupId}/members`);
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: {
            members: response.data.data.members || [],
            member_count: response.data.data.member_count || 0,
          },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch group members');
    } catch (error: any) {
      // Error in CommunityService.getGroupMembers:', error);
      return {
        success: false,
        data: { members: [], member_count: 0 },
        error: error.response?.data?.error || error.message || 'Failed to load group members',
      };
    }
  }

  /**
   * Get messages from a group
   */
  async getGroupMessages(groupId: number, page: number = 1, pageSize: number = 30): Promise<GetGroupMessagesResponse> {
    try {
      const response = await httpService.get(`/groups/${groupId}/messages`, {
        params: { page, pageSize },
      });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { messages: response.data.data.messages || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch group messages');
    } catch (error: any) {
      // Error in CommunityService.getGroupMessages:', error);
      return {
        success: false,
        data: { messages: [] },
        error: error.response?.data?.error || error.message || 'Failed to load group messages',
      };
    }
  }

  /**
   * Get last read status for all groups
   */
  async getLastReadStatus(): Promise<GetLastReadResponse> {
    try {
      const response = await httpService.get('/groups/last-read');
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { lastRead: response.data.data.lastRead || [] },
          message: response.data.message,
        };
      }
      throw new Error(response.data?.error || 'Failed to fetch last read status');
    } catch (error: any) {
      // Error in CommunityService.getLastReadStatus:', error);
      return {
        success: false,
        data: { lastRead: [] },
        error: error.response?.data?.error || error.message || 'Failed to load last read status',
      };
    }
  }

  /**
   * Mute or unmute a group
   */
  async muteGroup(groupId: number, mute: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/groups/${groupId}/mute`, { mute });
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to update mute state');
    } catch (error: any) {
      // Error in CommunityService.muteGroup:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update mute state',
      };
    }
  }

  /**
   * Pin a message in a group
   */
  async pinGroupMessage(groupId: number, messageId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/groups/${groupId}/messages/${messageId}/pin`, {});
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to pin message');
    } catch (error: any) {
      // Error in CommunityService.pinGroupMessage:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to pin message',
      };
    }
  }

  /**
   * Unpin a message in a group
   */
  async unpinGroupMessage(groupId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/groups/${groupId}/messages/unpin`, {});
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to unpin message');
    } catch (error: any) {
      // Error in CommunityService.unpinGroupMessage:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to unpin message',
      };
    }
  }

  /**
   * Create or get a DM conversation
   */
  async createOrGetDM(userId1: number, userId2: number): Promise<{ success: boolean; data?: { dmId: number }; error?: string }> {
    try {
      const response = await httpService.post('/dms/create-or-get', { userId1, userId2 });
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { dmId: response.data.data.dmId || response.data.data.id },
        };
      }
      throw new Error(response.data?.error || 'Failed to create or get DM');
    } catch (error: any) {
      // Error in CommunityService.createOrGetDM:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create or get DM',
      };
    }
  }

  /**
   * Send a message in a DM
   */
  async sendDMMessage(dmId: number, data: { content: string }): Promise<{ success: boolean; data?: { messageId: number; message: DMMessage }; error?: string }> {
    try {
      const response = await httpService.post(`/dms/${dmId}/messages`, data);
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: {
            messageId: response.data.data.messageId || response.data.data.id,
            message: response.data.data.message || response.data.data,
          },
        };
      }
      throw new Error(response.data?.error || 'Failed to send message');
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to send message',
      };
    }
  }

  /**
  async pinDMMessage(dmId: number, messageId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/dms/${dmId}/messages/${messageId}/pin`, {});
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to pin message');
    } catch (error: any) {
      // Error in CommunityService.pinDMMessage:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to pin message',
      };
    }
  }

  /**
   * Unpin a message in a DM
   */
  async unpinDMMessage(dmId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(`/dms/${dmId}/messages/unpin`, {});
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to unpin message');
    } catch (error: any) {
      // Error in CommunityService.unpinDMMessage:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to unpin message',
      };
    }
  }
}

export const communityService = CommunityService.getInstance();

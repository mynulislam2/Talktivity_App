/**
 * Community Service
 *
 * Service for managing DMs and Groups API calls.
 * Handles fetching DMs, groups, joining/leaving groups, and related operations.
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import type {
  DM,
  DMMessage,
  Group,
  GroupMember,
  GroupMessage,
  LastReadStatus,
} from '@/types/community';

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
      const response = await httpService.get(API_URLS.COMMUNITY.DMS);
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
        error:
          error.response?.data?.error || error.message || 'Failed to load DMs',
      };
    }
  }

  /**
   * Start a new DM conversation
   */
  async startDM(
    otherUserId: number
  ): Promise<{ success: boolean; data?: { dmId: number }; error?: string }> {
    try {
      const response = await httpService.post(API_URLS.COMMUNITY.DM_START, {
        otherUserId,
      });
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
        error:
          error.response?.data?.error || error.message || 'Failed to start DM',
      };
    }
  }

  /**
   * Get messages from a DM conversation
   */
  async getDMMessages(
    dmId: string,
    page: number = 1,
    pageSize: number = 30
  ): Promise<GetDMMessagesResponse> {
    try {
      const response = await httpService.get(
        API_URLS.COMMUNITY.DM_MESSAGES(dmId),
        {
          params: { page, pageSize },
        }
      );
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load messages',
      };
    }
  }

  /**
   * Mark a DM conversation as read
   */
  async markDMAsRead(
    dmId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(API_URLS.COMMUNITY.DM_READ(dmId));
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to mark DM as read');
    } catch (error: any) {
      // Error in CommunityService.markDMAsRead:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to mark as read',
      };
    }
  }

  /**
   * Archive a DM conversation
   */
  async archiveDM(dmId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.DM_ARCHIVE(dmId)
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to archive DM');
    } catch (error: any) {
      // Error in CommunityService.archiveDM:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to archive DM',
      };
    }
  }

  /**
   * Get all groups with optional filters
   */
  async getGroups(
    search?: string,
    category?: string
  ): Promise<GetGroupsResponse> {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await httpService.get(API_URLS.COMMUNITY.GROUPS, {
        params,
      });
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load groups',
      };
    }
  }

  /**
   * Get groups the user has joined
   */
  async getJoinedGroups(): Promise<GetJoinedGroupsResponse> {
    try {
      const response = await httpService.get(API_URLS.COMMUNITY.GROUPS_JOINED);
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load joined groups',
      };
    }
  }

  /**
   * Join a group
   */
  async joinGroup(
    groupId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_JOIN(groupId)
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to join group');
    } catch (error: any) {
      // Error in CommunityService.joinGroup:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to join group',
      };
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(
    groupId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_LEAVE(groupId)
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to leave group');
    } catch (error: any) {
      // Error in CommunityService.leaveGroup:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to leave group',
      };
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId: number): Promise<GetGroupMembersResponse> {
    try {
      const response = await httpService.get(
        API_URLS.COMMUNITY.GROUP_MEMBERS(groupId)
      );
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load group members',
      };
    }
  }

  /**
   * Get messages from a group
   */
  async getGroupMessages(
    groupId: number,
    page: number = 1,
    pageSize: number = 30
  ): Promise<GetGroupMessagesResponse> {
    try {
      const response = await httpService.get(
        API_URLS.COMMUNITY.GROUP_MESSAGES(groupId),
        {
          params: { page, pageSize },
        }
      );
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load group messages',
      };
    }
  }

  /**
   * Get last read status for all groups
   */
  async getLastReadStatus(): Promise<GetLastReadResponse> {
    try {
      const response = await httpService.get(
        API_URLS.COMMUNITY.GROUP_LAST_READ
      );
      if (response.data?.success && response.data?.data) {
        return {
          success: true,
          data: { lastRead: response.data.data.lastRead || [] },
          message: response.data.message,
        };
      }
      throw new Error(
        response.data?.error || 'Failed to fetch last read status'
      );
    } catch (error: any) {
      // Error in CommunityService.getLastReadStatus:', error);
      return {
        success: false,
        data: { lastRead: [] },
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to load last read status',
      };
    }
  }

  /**
   * Mute or unmute a group
   */
  async muteGroup(
    groupId: number,
    mute: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_MUTE(groupId),
        { mute }
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to update mute state');
    } catch (error: any) {
      // Error in CommunityService.muteGroup:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to update mute state',
      };
    }
  }

  /**
   * Mark a Group conversation as read
   */
  async markGroupAsRead(
    groupId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_READ(groupId)
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to mark group as read');
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to mark group as read',
      };
    }
  }

  /**
   * Pin a message in a group
   */
  async pinGroupMessage(
    groupId: number,
    messageId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_MESSAGE_PIN(groupId, messageId),
        {}
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to pin message');
    } catch (error: any) {
      // Error in CommunityService.pinGroupMessage:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to pin message',
      };
    }
  }

  /**
   * Unpin a message in a group
   */
  async unpinGroupMessage(
    groupId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_MESSAGES_UNPIN(groupId),
        {}
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to unpin message');
    } catch (error: any) {
      // Error in CommunityService.unpinGroupMessage:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to unpin message',
      };
    }
  }

  /**
   * Create or get a DM conversation
   *
   * Backward-compatible alias for older callers.
   */
  async createOrGetDM(
    userId1: number,
    userId2: number
  ): Promise<{ success: boolean; data?: { dmId: number }; error?: string }> {
    void userId1;
    return this.startDM(userId2);
  }

  /**
   * Send a message in a DM
   */
  async sendDMMessage(
    dmId: number,
    data: { content: string }
  ): Promise<{
    success: boolean;
    data?: { messageId: number; message: DMMessage };
    error?: string;
  }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.DM_MESSAGES(dmId),
        data
      );
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to send message',
      };
    }
  }

  /**
   * Send a message in a group
   */
  async sendGroupMessage(
    groupId: number,
    data: { content: string }
  ): Promise<{
    success: boolean;
    data?: { messageId: number; message: GroupMessage };
    error?: string;
  }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.GROUP_MESSAGES(groupId),
        data
      );
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
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to send message',
      };
    }
  }

  /**
   * Pin a message in a DM
   */
  async pinDMMessage(
    dmId: number,
    messageId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.DM_MESSAGE_PIN(dmId, messageId),
        {}
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to pin message');
    } catch (error: any) {
      // Error in CommunityService.pinDMMessage:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to pin message',
      };
    }
  }

  /**
   * Unpin a message in a DM
   */
  async unpinDMMessage(
    dmId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await httpService.post(
        API_URLS.COMMUNITY.DM_MESSAGES_UNPIN(dmId),
        {}
      );
      if (response.data?.success) {
        return { success: true };
      }
      throw new Error(response.data?.error || 'Failed to unpin message');
    } catch (error: any) {
      // Error in CommunityService.unpinDMMessage:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to unpin message',
      };
    }
  }
}

export const communityService = CommunityService.getInstance();

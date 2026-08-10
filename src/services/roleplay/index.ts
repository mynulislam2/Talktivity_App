/**
 * RoleplayService
 *
 * Service for managing role-play API calls.
 * Backend: Agentserver /api/roleplays (authenticated).
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface RoleplaySession {
  id: number;
  user_id: number;
  title: string;
  prompt: string;
  first_prompt: string;
  my_role: string;
  other_role: string;
  situation: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoleplaysResponse {
  success: boolean;
  data: RoleplaySession[];
  message?: string;
}

export interface CreateRoleplayResponse {
  success: boolean;
  data: RoleplaySession;
  message?: string;
}

class RoleplayService {
  async getRoleplays(): Promise<RoleplaysResponse> {
    const response = await httpService.get(API_URLS.ROLEPLAY.LIST);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message,
      };
    }
    throw new Error(response.data.error || 'Failed to fetch roleplays');
  }

  async createRoleplay(payload: {
    title: string;
    prompt: string;
    firstPrompt: string;
    myRole: string;
    otherRole: string;
    situation: string;
    imageUrl?: string | null;
  }): Promise<CreateRoleplayResponse> {
    const response = await httpService.post(API_URLS.ROLEPLAY.LIST, payload);
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    }
    throw new Error(response.data.error || 'Failed to create roleplay');
  }

  async deleteRoleplay(roleplayId: number): Promise<void> {
    const response = await httpService.delete(
      API_URLS.ROLEPLAY.DETAIL(roleplayId)
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete roleplay');
    }
  }
}

export const roleplayService = new RoleplayService();
export default roleplayService;

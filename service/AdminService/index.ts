
import { httpService } from '../httpservice';

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  google_id?: string | null;
  profile_picture?: string | null;
  completed_calls: number;
  total_conversation_duration: number;
  last_activity: string;
  status: 'Registered' | 'Onboarded' | 'Active' | 'Both' | string;
  used_discount_token?: boolean;
}

export interface AdminUsersPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AdminUsersWithPaginationResponse {
  users: AdminUser[];
  pagination: AdminUsersPagination;
}

export interface AdminStats {
  totalRegistered: number;
  totalOnboarded: number;
  totalCalls: number;
  totalCourses: number;
  totalConversationDurationSeconds: number;
}

export interface DiscountToken {
  id: number;
  token_code: string;
  discount_percent: number;
  plan_type: string | null;
  expires_at: string | null;
  max_uses: number | null;
  max_users: number | null;
  is_active: boolean;
  created_by: number;
  created_by_email?: string;
  usage_count: number;
  unique_user_count: number;
  status: 'active' | 'inactive' | 'expired' | 'max_users_reached';
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDiscountTokenData {
  token_code: string;
  discount_percent: number;
  plan_type?: string | null;
  expires_at?: string | null;
  max_uses?: number | null;
  max_users?: number | null;
}

export interface UpdateDiscountTokenData {
  token_code?: string;
  discount_percent?: number;
  plan_type?: string | null;
  expires_at?: string | null;
  max_uses?: number | null;
  max_users?: number | null;
  is_active?: boolean;
}

type SuccessEnvelope<T> = { success: boolean; data: T; message?: string };

class AdminService {
  /**
   * GET /api/admin/users?search=&page=&limit=
   */
  async getUsersWithPagination(filters: {
    search?: string;
    page?: number;
    limit?: number;
    usedDiscountToken?: boolean;
  } = {}): Promise<AdminUsersWithPaginationResponse> {
    const response = await httpService.get('/users', {
      params: filters,
      serviceType: 'admin',
    });

    const payload =
      (response.data as SuccessEnvelope<AdminUsersWithPaginationResponse>)?.data ?? response.data;
    return payload;
  }

  /**
   * GET /api/admin/stats
   */
  async getUserStats(): Promise<AdminStats> {
    const response = await httpService.get('/stats', { serviceType: 'admin' });
    const payload = (response.data as SuccessEnvelope<AdminStats>)?.data ?? response.data;
    return payload;
  }

  /**
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(userId: string): Promise<void> {
    await httpService.delete(`/users/${userId}`, undefined, 'admin');
  }

  /**
   * POST /api/admin/users/bulk-delete
   */
  async bulkDelete(userIds: string[]): Promise<{ deletedCount: number }> {
    const response = await httpService.post('/users/bulk-delete', { userIds }, 'admin');
    const payload = (response.data as SuccessEnvelope<{ deletedCount: number }>)?.data ?? response.data;
    return payload;
  }

  /**
   * GET /api/admin/verify-admin
   */
  async verifyAdmin(): Promise<boolean> {
    const response = await httpService.get('/verify-admin', { serviceType: 'admin' });
    const payload = (response.data as SuccessEnvelope<{ isAdmin?: boolean }>)?.data ?? response.data;
    return !!(payload as any)?.isAdmin || (response.data as any)?.success === true;
  }

  /**
   * GET /api/admin/check-admin-status
   */
  async checkAdminStatus(): Promise<boolean> {
    const response = await httpService.get('/check-admin-status', { serviceType: 'admin' });
    const payload = (response.data as SuccessEnvelope<{ isAdmin: boolean }>)?.data ?? response.data;
    return !!(payload as any)?.isAdmin;
  }

  /**
   * POST /api/admin/discount-tokens
   */
  async createDiscountToken(data: CreateDiscountTokenData): Promise<DiscountToken> {
    const response = await httpService.post('/discount-tokens', data, 'admin');
    const payload = (response.data as SuccessEnvelope<DiscountToken>)?.data ?? response.data;
    return payload;
  }

  /**
   * GET /api/admin/discount-tokens
   */
  async getDiscountTokens(): Promise<DiscountToken[]> {
    const response = await httpService.get('/discount-tokens', { serviceType: 'admin' });
    const payload = (response.data as SuccessEnvelope<DiscountToken[]>)?.data ?? response.data;
    return payload;
  }

  /**
   * PUT /api/admin/discount-tokens/:id
   */
  async updateDiscountToken(id: number, data: UpdateDiscountTokenData): Promise<DiscountToken> {
    const response = await httpService.put(`/discount-tokens/${id}`, data, 'admin');
    const payload = (response.data as SuccessEnvelope<DiscountToken>)?.data ?? response.data;
    return payload;
  }

  /**
   * DELETE /api/admin/discount-tokens/:id
   */
  async deleteDiscountToken(id: number): Promise<void> {
    await httpService.delete(`/discount-tokens/${id}`, undefined, 'admin');
  }
}

export const adminService = new AdminService();

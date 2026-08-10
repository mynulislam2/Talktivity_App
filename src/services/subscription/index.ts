import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface SubscriptionPlan {
  id: number;
  plan_type: 'Basic' | 'Pro' | 'FreeTrial';
  name: string;
  price_usd: number;
  talk_time_minutes: number;
  max_scenarios: number | null; // null = unlimited
  features: string[];
  description: string;
  is_active: boolean;
}

export interface SubscriptionStatus {
  active: boolean;
  subscription?: {
    id: number;
    plan_type: string;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    start_date: string;
    end_date: string;
    is_free_trial: boolean;
    trial_ends_at?: string;
  };
  plan?: SubscriptionPlan;
  canStartFreeTrial?: boolean;
}

export interface GetPlansResponse {
  success: boolean;
  data?: SubscriptionPlan[];
  error?: string;
}

export interface GetSubscriptionStatusResponse {
  success: boolean;
  data?: SubscriptionStatus;
  error?: string;
}

export interface FreeTrialResponse {
  success: boolean;
  data?: {
    subscription: SubscriptionStatus['subscription'];
    trialEndsAt: string;
  };
  error?: string;
}

class SubscriptionService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Get all plans (GET /api/subscriptions/plans)
  async getPlans(): Promise<GetPlansResponse> {
    try {
      const response = await httpService.get(API_URLS.SUBSCRIPTION.PLANS);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to fetch plans',
      };
    }
  }

  // Get subscription status (GET /api/subscriptions/status)
  async getSubscriptionStatus(): Promise<GetSubscriptionStatusResponse> {
    try {
      const response = await httpService.get(API_URLS.SUBSCRIPTION.STATUS);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to fetch subscription status',
      };
    }
  }

  // Start free trial (POST /api/subscriptions/start-free-trial)
  async startFreeTrial(): Promise<FreeTrialResponse> {
    try {
      const response = await httpService.post(
        API_URLS.SUBSCRIPTION.START_FREE_TRIAL,
        {}
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          'Failed to start free trial',
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();

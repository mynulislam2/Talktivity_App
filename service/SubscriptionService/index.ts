import { httpService } from "../httpservice";
import { authService } from "../AuthService";

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
      const response = await httpService.get("/subscriptions/plans");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Failed to fetch plans',
      };
    }
  }

  // Get subscription status (GET /api/subscriptions/status)
  async getSubscriptionStatus(): Promise<GetSubscriptionStatusResponse> {
    try {
      const response = await httpService.get("/subscriptions/status");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Failed to fetch subscription status',
      };
    }
  }

  // Start free trial (POST /api/subscriptions/start-free-trial)
  async startFreeTrial(): Promise<FreeTrialResponse> {
    try {
      const response = await httpService.post("/subscriptions/start-free-trial", {});
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Failed to start free trial',
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();

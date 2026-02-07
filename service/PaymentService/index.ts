import { httpService } from "../httpservice";
import { authService } from "../AuthService";

export interface CreatePaymentRequest {
  planId: number | string;
  planType?: 'Basic' | 'Pro';
}

export interface CreatePaymentResponse {
  success: boolean;
  data?: {
    paymentUrl: string;
    transactionId: string;
    orderId: string;
  };
  error?: string;
}

class PaymentService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Create payment (POST /api/payments/create)
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await httpService.post("/payments/create", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Failed to create payment',
      };
    }
  }
}

export const paymentService = new PaymentService();

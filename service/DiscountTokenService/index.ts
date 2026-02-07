import { httpService } from "../httpservice";

export interface ValidateTokenResponse {
  success: boolean;
  data?: {
    originalPrice: number;
    discountPercent: number;
    discountAmount: number;
    discountedPrice: number;
  };
  error?: string;
}

export interface ApplyTokenResponse {
  success: boolean;
  data?: {
    originalPrice: number;
    discountPercent: number;
    discountAmount: number;
    discountedPrice: number;
  };
  error?: string;
}

class DiscountTokenService {
  /**
   * Validate a discount token (frontend validation for UX)
   * Note: Backend validation is required for security
   */
  async validateToken(tokenCode: string, planType: string): Promise<ValidateTokenResponse> {
    try {
      const response = await httpService.post('/discount-tokens/validate', {
        tokenCode,
        planType
      });

      // Handle response following the same pattern as AdminService
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data
        };
      }

      return {
        success: false,
        error: response.data.error || 'Failed to validate token'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Failed to validate token'
      };
    }
  }

  /**
   * Calculate discounted price (client-side calculation for display)
   */
  applyToken(originalPrice: number, discountPercent: number): ApplyTokenResponse {
    try {
      const discountAmount = (originalPrice * discountPercent) / 100;
      const discountedPrice = Math.max(0, originalPrice - discountAmount);

      return {
        success: true,
        data: {
          originalPrice: parseFloat(originalPrice.toFixed(2)),
          discountPercent: parseFloat(discountPercent.toFixed(2)),
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          discountedPrice: parseFloat(discountedPrice.toFixed(2))
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to calculate discount'
      };
    }
  }
}

export const discountTokenService = new DiscountTokenService();

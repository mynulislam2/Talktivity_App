import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import type { ProficiencyResponse } from '@/types/proficiency';

interface ServiceErrorShape {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
}

class ProficiencyService {
  private static instance: ProficiencyService;

  private constructor() {}

  static getInstance(): ProficiencyService {
    if (!ProficiencyService.instance) {
      ProficiencyService.instance = new ProficiencyService();
    }
    return ProficiencyService.instance;
  }

  async getProficiency(): Promise<ProficiencyResponse> {
    try {
      const response = await httpService.get(API_URLS.REPORT.PROFICIENCY);
      return response.data as ProficiencyResponse;
    } catch (error: unknown) {
      const serviceError = error as ServiceErrorShape;
      return {
        success: false,
        error:
          serviceError.response?.data?.error ||
          serviceError.response?.data?.message ||
          serviceError.message ||
          'Failed to load proficiency',
      };
    }
  }
}

export const proficiencyService = ProficiencyService.getInstance();
export { ProficiencyService };

/**
 * AiService
 *
 * Service for AI-related API calls (roleplay generation, quiz generation, etc.)
 */

import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

interface GenerateRolePlayResponse {
  success: boolean;
  data?: {
    prompt: string;
    firstPrompt: string;
  };
  error?: string;
}

interface GenerateQuizResponse {
  success: boolean;
  data?: any[];
  error?: string;
}

class AiService {
  private static instance: AiService;

  private constructor() {}

  static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * Generate roleplay scenario prompts
   */
  async generateRolePlay(
    myRole: string,
    otherRole: string,
    situation: string
  ): Promise<GenerateRolePlayResponse> {
    try {
      const response = await httpService.post(API_URLS.AI.GENERATE_ROLEPLAY, {
        myRole,
        otherRole,
        situation,
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to generate roleplay',
        };
      }
    } catch (error: any) {
      // Error generating roleplay
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to generate roleplay',
      };
    }
  }

  /**
   * Generate quiz from conversations
   */
  async generateQuiz(): Promise<GenerateQuizResponse> {
    try {
      const response = await httpService.get(API_URLS.AI.GENERATE_QUIZ);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to generate quiz',
        };
      }
    } catch (error: any) {
      // Error generating quiz
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to generate quiz',
      };
    }
  }

  /**
   * Generate listening quiz
   */
  async generateListeningQuiz(
    conversation: string
  ): Promise<GenerateQuizResponse> {
    try {
      const response = await httpService.post(
        API_URLS.AI.GENERATE_LISTENING_QUIZ,
        {
          conversation,
        }
      );

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Failed to generate listening quiz',
        };
      }
    } catch (error: any) {
      // Error generating listening quiz
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Failed to generate listening quiz',
      };
    }
  }
}

export { AiService };
export default AiService;

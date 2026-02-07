
import { httpService } from "../httpservice";
import { authService } from "../AuthService";

export interface ReportData {
  fluency?: any;
  grammar?: any;
  vocabulary?: any;
  discourse?: any;
}

export interface GenerateCallReportResponse {
  success: boolean;
  data?: {
    report: ReportData;
    cached?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  error?: string;
}

class ReportService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Get daily report (GET /api/reports/daily)
  async getDailyReport(): Promise<any> {
    const response = await httpService.get("/reports/daily");
    return response.data;
  }


  // Generate call report (GET /api/reports/call)
  // Collects all conversations, sends to Groq, validates response structure
  async generateCallReport(): Promise<GenerateCallReportResponse> {
    try {
      const response = await httpService.get("/reports/call");
      return response.data;
    } catch (error: any) {
      // Extract error message from various possible locations
      const errorMessage = 
        error?.response?.data?.error || 
        error?.response?.data?.message ||
        error?.message || 
        'Failed to generate report';
      
      // [ReportService] Error generating call report
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}

export const reportService = new ReportService();

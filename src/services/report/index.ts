import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';

export interface FluencyReport {
  fluencyScore: number;
  fluencyLevel: string;
  improvementTarget?: { percentToNextLevel: number; nextLevel: string } | null;
  fillerWords?: any;
  wordsPerMinute?: any;
  hesitationsAndCorrections?: any;
}

export interface GrammarReport {
  grammarScore: number;
  grammarLevel: string;
  improvementTarget?: { percentToNextLevel: number; nextLevel: string } | null;
  growthPoints?: any;
  improvementDescription?: string;
  grammarErrors?: any;
  sentenceComplexity?: any;
}

export interface VocabularyReport {
  vocabularyScore: number;
  vocabularyLevel: string;
  improvementTarget?: { percentToNextLevel: number; nextLevel: string } | null;
  activeVocabulary?: number;
  uniqueWords?: number;
  lexicalDiversity?: any;
  levelBreakdown?: any;
  wordSuggestions?: any;
  exampleSentences?: any;
  idiomaticLanguage?: any;
}

export interface DiscourseReport {
  discourseScore: number;
  discourseLevel: string;
  improvementTarget?: { percentToNextLevel: number; nextLevel: string } | null;
  cohesion?: any;
  coherence?: any;
}

export interface ReportData {
  fluency: FluencyReport;
  grammar: GrammarReport;
  vocabulary: VocabularyReport;
  discourse: DiscourseReport;
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
  code?: string;
  status?: number;
}

export interface GenerateCallReportOptions {
  roomName?: string | null;
}

type ApiError = {
  response?: {
    status?: number;
    data?: {
      code?: string;
      error?: string;
      message?: string;
    };
  };
  code?: string;
  message?: string;
};

const FRIENDLY_REPORT_RETRY_MESSAGE = 'Please try again after some time.';

export const TALK_MORE_CODES = [
  'CALL_RETRY_GRANTED',
  'TRANSCRIPT_TOO_SHORT',
] as const;
export const PENDING_CODES = ['REPORT_DATA_NOT_READY'] as const;

export type ReportPhaseHint = 'talkMore' | 'pending' | 'terminal';

export function classifyReportError(
  code: string | null | undefined,
  status?: number
): ReportPhaseHint {
  if (code && (TALK_MORE_CODES as readonly string[]).includes(code))
    return 'talkMore';
  if (
    (code && (PENDING_CODES as readonly string[]).includes(code)) ||
    code === 'ECONNABORTED' ||
    status === 408 ||
    (typeof status === 'number' && status >= 500)
  ) {
    return 'pending';
  }
  if (!code) return 'pending';
  return 'terminal';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapReportPayload(report: unknown) {
  const reportData = asRecord(report);
  return reportData?.report ?? report;
}

function normalizeCallReport(report: unknown): ReportData {
  const backendData = asRecord(report);
  const reportData = asRecord(backendData?.report || backendData);

  const fluency: FluencyReport = {
    fluencyScore: Number(
      asRecord(reportData?.fluency)?.fluencyScore ||
        asRecord(reportData?.fluency)?.score ||
        0
    ),
    fluencyLevel: String(
      asRecord(reportData?.fluency)?.fluencyLevel ||
        asRecord(reportData?.fluency)?.level ||
        'A1'
    ),
  };

  const grammar: GrammarReport = {
    grammarScore: Number(
      asRecord(reportData?.grammar)?.grammarScore ||
        asRecord(reportData?.grammar)?.score ||
        0
    ),
    grammarLevel: String(
      asRecord(reportData?.grammar)?.grammarLevel ||
        asRecord(reportData?.grammar)?.level ||
        'A1'
    ),
  };

  const vocabulary: VocabularyReport = {
    vocabularyScore: Number(
      asRecord(reportData?.vocabulary)?.vocabularyScore ||
        asRecord(reportData?.vocabulary)?.score ||
        0
    ),
    vocabularyLevel: String(
      asRecord(reportData?.vocabulary)?.vocabularyLevel ||
        asRecord(reportData?.vocabulary)?.level ||
        'A1'
    ),
  };

  const discourse: DiscourseReport = {
    discourseScore: Number(
      asRecord(reportData?.discourse)?.discourseScore ||
        asRecord(reportData?.discourse)?.score ||
        0
    ),
    discourseLevel: String(
      asRecord(reportData?.discourse)?.discourseLevel ||
        asRecord(reportData?.discourse)?.level ||
        'A1'
    ),
  };

  return {
    ...reportData,
    fluency: { ...asRecord(reportData?.fluency), ...fluency } as FluencyReport,
    grammar: { ...asRecord(reportData?.grammar), ...grammar } as GrammarReport,
    vocabulary: {
      ...asRecord(reportData?.vocabulary),
      ...vocabulary,
    } as VocabularyReport,
    discourse: {
      ...asRecord(reportData?.discourse),
      ...discourse,
    } as DiscourseReport,
  } as unknown as ReportData;
}

function getReportErrorCode(error: unknown): string | undefined {
  const apiError = (
    typeof error === 'object' && error !== null ? error : {}
  ) as ApiError;
  return apiError.response?.data?.code || apiError.code;
}

function getFriendlyReportError(error: unknown, fallback: string) {
  const apiError = (
    typeof error === 'object' && error !== null ? error : {}
  ) as ApiError;
  const status = apiError.response?.status;
  const code = apiError.response?.data?.code || apiError.code;
  const message =
    apiError.response?.data?.error ||
    apiError.response?.data?.message ||
    apiError.message ||
    fallback;

  if (code === 'CALL_RETRY_GRANTED' || code === 'TRANSCRIPT_TOO_SHORT') {
    return message;
  }

  if (
    code === 'REPORT_DATA_NOT_READY' ||
    code === 'ECONNABORTED' ||
    status === 408 ||
    status === 409 ||
    (typeof status === 'number' && status >= 500)
  ) {
    return FRIENDLY_REPORT_RETRY_MESSAGE;
  }

  return message;
}

class ReportService {
  async getDailyReport(): Promise<any> {
    try {
      const response = await httpService.get(API_URLS.REPORT.DAILY);
      return response.data;
    } catch (error: unknown) {
      throw new Error(
        getFriendlyReportError(error, "Failed to load today's report")
      );
    }
  }

  async generateCallReport(
    options: GenerateCallReportOptions = {}
  ): Promise<GenerateCallReportResponse> {
    try {
      const response = await httpService.get(API_URLS.REPORT.CALL, {
        params: options.roomName ? { roomName: options.roomName } : undefined,
      });
      const responseData = response.data as GenerateCallReportResponse;
      if (!responseData.success) {
        return responseData;
      }
      const report = unwrapReportPayload(responseData.data?.report);
      return {
        ...responseData,
        data: {
          ...(responseData.data || {}),
          report: normalizeCallReport(report),
        },
      };
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      return {
        success: false,
        error: getFriendlyReportError(error, 'Failed to generate report'),
        code: getReportErrorCode(error),
        status: apiError?.response?.status,
      };
    }
  }
}

export const reportService = new ReportService();

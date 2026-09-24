import { Platform } from 'react-native';
import { HttpService } from '../http/httpservice';

export interface IeltsSpeakingTest {
  id: string;
  test_set_id: string;
  title: string;
  description?: string;
  category?: string;
  part1_duration_seconds: number;
  part1_theme?: string;
  part1_context_prompt?: string;
  part1_example_questions?: string[];
  part2_prep_seconds: number;
  part2_speaking_seconds: number;
  part2_title?: string;
  part2_bullet_points?: string[];
  part2_preparation_hint?: string;
  part3_duration_seconds: number;
  part3_theme?: string;
  part3_context_prompt?: string;
  part3_example_questions?: string[];
}

/** Sent to students before submit; never carries the answer. */
export interface IeltsListeningQuestion {
  question_number: number;
  question_text: string;
  type:
    | 'multiple_choice'
    | 'multiple_select'
    | 'fill_in_the_blank'
    | 'form_completion'
    | 'matching';
  options?: string[];
  max_selections?: number;
  prefix_text?: string;
  suffix_text?: string;
  matching_title?: string;
  timestamp_seconds?: number;
}

export interface IeltsListeningPart {
  part_number: 1 | 2 | 3 | 4;
  title: string;
  audio_url: string;
  questions: IeltsListeningQuestion[];
}

export interface IeltsListeningTest {
  id: string;
  test_set_id: string;
  title: string;
  cambridge_book?: string | null;
  parts: IeltsListeningPart[];
}

export interface IeltsListeningResult {
  question_number: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface IeltsListeningSubmitResponse {
  score: number;
  total: number;
  /** Full test only; null for a single-part drill. */
  band: number | null;
  session_id: string;
  detailedResults: IeltsListeningResult[];
}

export type IeltsPartStatus = 'not_started' | 'in_progress' | 'completed' | string;

export interface IeltsTestSession {
  id: string;
  user_id: number;
  test_set_id: string;
  test_type: 'speaking' | 'listening';
  session_mode: 'drill' | 'mock';
  part1_status: IeltsPartStatus;
  part2_status: IeltsPartStatus;
  part3_status: IeltsPartStatus;
  overall_status: 'in_progress' | 'completed' | string;
  overall_band?: number | string | null;
  fluency_band?: number | string | null;
  lexical_band?: number | string | null;
  grammar_band?: number | string | null;
  pronunciation_band?: number | string | null;
}

/** `report` on the /complete response: server-computed bands plus short feedback. */
export interface IeltsSpeakingReport {
  overall_band?: number | string | null;
  fluency_band?: number | string | null;
  lexical_band?: number | string | null;
  grammar_band?: number | string | null;
  pronunciation_band?: number | string | null;
  feedback?: string | string[] | null;
}

export type IeltsCompleteResponse = IeltsTestSession & {
  report?: IeltsSpeakingReport | null;
};

export type IeltsDefaultFocus = 'foundation' | 'drills' | 'mock_exam';

const PART_TITLES: Record<1 | 2 | 3 | 4, string> = {
  1: 'Part 1: Everyday conversation',
  2: 'Part 2: Everyday monologue',
  3: 'Part 3: Academic discussion',
  4: 'Part 4: Academic lecture',
};

// Base MIME types the presign endpoint accepts, keyed by file extension.
const RECORDING_MIME_BY_EXT: Record<string, string> = {
  webm: 'audio/webm',
  ogg: 'audio/ogg',
  m4a: 'audio/m4a',
  mp4: 'audio/mp4',
  aac: 'audio/aac',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

/** The recording's real type: its file extension, else the blob's MIME (codecs stripped). */
export function recordingFormat(uri: string, blobType?: string): { fileType: string; ext: string } {
  const uriExt = /\.([a-z0-9]+)$/i.exec(uri.split(/[?#]/)[0])?.[1]?.toLowerCase();
  if (uriExt && RECORDING_MIME_BY_EXT[uriExt]) {
    return { fileType: RECORDING_MIME_BY_EXT[uriExt], ext: uriExt };
  }
  const mime = (blobType || '').split(';')[0].trim().toLowerCase();
  if (mime === 'audio/x-m4a') return { fileType: 'audio/m4a', ext: 'm4a' };
  if (mime === 'audio/mp3') return { fileType: 'audio/mpeg', ext: 'mp3' };
  const ext = Object.keys(RECORDING_MIME_BY_EXT).find((e) => RECORDING_MIME_BY_EXT[e] === mime);
  if (ext) return { fileType: mime, ext };
  return Platform.OS === 'web'
    ? { fileType: 'audio/webm', ext: 'webm' }
    : { fileType: 'audio/m4a', ext: 'm4a' };
}

export class IeltsService {
  private http = HttpService.getInstance();

  private normalizeListeningTest(raw: any): IeltsListeningTest {
    const parts = ([1, 2, 3, 4] as const).map((n) => ({
      part_number: n,
      title: PART_TITLES[n],
      audio_url: raw[`part${n}_audio_url`] || '',
      questions: raw[`part${n}_questions`] || [],
    }));

    return {
      id: raw.id,
      test_set_id: raw.test_set_id,
      title: raw.title || 'IELTS Listening Practice Test',
      cambridge_book: raw.cambridge_book ?? null,
      parts,
    };
  }

  async getSpeakingTests(): Promise<IeltsSpeakingTest[]> {
    const res = await this.http.get('ielts/speaking/tests');
    return (res.data as any)?.data || [];
  }

  async getListeningTests(): Promise<IeltsListeningTest[]> {
    const res = await this.http.get('ielts/listening/tests');
    const list = (res.data as any)?.data || [];
    return list.map((item: any) => this.normalizeListeningTest(item));
  }

  async getPresignedAudioUploadUrl(params: {
    fileName: string;
    fileType?: string;
  }): Promise<{ uploadUrl: string; key: string }> {
    const res = await this.http.post('ielts/audio/presign', params);
    return (res.data as any)?.data;
  }

  /** Uploads a local recording; resolves to its storage key or throws. */
  async uploadPart2Audio(fileUri: string): Promise<string> {
    const blob = await (await fetch(fileUri)).blob();
    // Web records webm (blob: URL, no extension); native records .m4a.
    const { fileType, ext } = recordingFormat(fileUri, blob.type);
    const presigned = await this.getPresignedAudioUploadUrl({
      fileName: `part2_${Date.now()}.${ext}`,
      fileType,
    });
    if (!presigned?.uploadUrl || !presigned?.key) {
      throw new Error('Upload is not available right now');
    }

    const uploadRes = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': fileType },
      body: blob,
    });
    if (!uploadRes.ok) {
      throw new Error(`Recording upload failed (${uploadRes.status})`);
    }
    return presigned.key;
  }

  async startTestSession(data: {
    testSetId?: string;
    sessionMode: 'drill' | 'mock';
    testType: 'speaking';
    part?: 1 | 2 | 3;
  }): Promise<IeltsTestSession> {
    const res = await this.http.post('ielts/sessions/start', data);
    return (res.data as any)?.data;
  }

  async getSession(sessionId: string): Promise<IeltsTestSession> {
    const res = await this.http.get(`ielts/sessions/${sessionId}`);
    return (res.data as any)?.data;
  }

  async savePart2Submission(
    sessionId: string,
    data: { audioKey: string; topic?: string }
  ): Promise<IeltsTestSession> {
    const res = await this.http.post(`ielts/sessions/${sessionId}/part2`, data);
    return (res.data as any)?.data;
  }

  /** Server scores the completed parts; any client-sent bands are ignored. */
  async completeTestSession(sessionId: string): Promise<IeltsCompleteResponse> {
    const res = await this.http.post(`ielts/sessions/${sessionId}/complete`, {});
    return (res.data as any)?.data;
  }

  async getPart3Context(sessionId: string): Promise<{
    part2_topic?: string;
    part2_summary?: string;
  }> {
    const res = await this.http.get(`ielts/sessions/${sessionId}/context`);
    return (res.data as any)?.data;
  }

  async submitListeningTest(data: {
    testSetId: string;
    answers: Record<string, string | string[]>;
    part?: 1 | 2 | 3 | 4;
  }): Promise<IeltsListeningSubmitResponse> {
    const res = await this.http.post('ielts/listening/submit', data);
    return (res.data as any)?.data;
  }

  async updatePreferences(defaultFocus: IeltsDefaultFocus): Promise<{ ielts_default_focus: IeltsDefaultFocus }> {
    const res = await this.http.put('ielts/preferences', { defaultFocus });
    return (res.data as any)?.data;
  }
}

export const ieltsService = new IeltsService();

import { HttpService } from '../http/httpservice';

export interface IeltsSpeakingTest {
  id: number;
  test_code?: string;
  test_set_id?: string;
  title: string;
  description?: string;
  set_number?: number;
  difficulty?: string;
  category?: string;
  part1_duration_seconds: number;
  part1_theme?: string;
  part1_context_prompt?: string;
  part1_example_questions?: string[];
  part1_topics?: Array<{
    theme: string;
    questions: string[];
    ai_context_prompt?: string;
  }>;
  part2_prep_seconds: number;
  part2_speaking_seconds: number;
  part2_title?: string;
  part2_bullet_points?: string[];
  part2_preparation_hint?: string;
  part2_cue_card?: {
    topic: string;
    bullets: string[];
    preparation_prompt?: string;
  };
  part3_duration_seconds: number;
  part3_theme?: string;
  part3_context_prompt?: string;
  part3_example_questions?: string[];
  part3_topics?: Array<{
    theme: string;
    questions: string[];
    ai_context_prompt?: string;
  }>;
}

export interface IeltsListeningQuestion {
  question_number: number;
  question_text: string;
  type: 'multiple_choice' | 'fill_in_the_blank';
  options?: string[];
  correct_answer?: string;
  timestamp_seconds?: number;
  explanation?: string;
}

export interface IeltsListeningPart {
  part_number: number;
  title: string;
  instructions: string;
  audio_url?: string;
  questions: IeltsListeningQuestion[];
}

export interface IeltsListeningTest {
  id: number;
  test_code: string;
  title: string;
  audio_url: string;
  duration_seconds?: number;
  parts: IeltsListeningPart[];
}

export interface IeltsTestSession {
  id: number;
  user_id: number;
  speaking_test_id?: number;
  listening_test_id?: number;
  session_type: 'speaking' | 'listening' | 'full_mock';
  current_part: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  part1_session_id?: number;
  part2_session_id?: number;
  part3_session_id?: number;
  part2_recording_url?: string;
  listening_answers?: Record<string, string>;
  listening_score?: number;
  overall_band?: number;
}

export class IeltsService {
  private http = HttpService.getInstance();

  private normalizeListeningTest(raw: any): IeltsListeningTest {
    const parts: IeltsListeningPart[] = raw.parts || [
      {
        part_number: 1,
        title: 'Part 1: Social Needs & Forms',
        instructions: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.',
        audio_url: raw.part1_audio_url || raw.audio_url || '',
        questions: raw.part1_questions || [],
      },
      {
        part_number: 2,
        title: 'Part 2: Monologue on Everyday Topic',
        instructions: 'Choose the correct letter, A, B, or C.',
        audio_url: raw.part2_audio_url || raw.audio_url || '',
        questions: raw.part2_questions || [],
      },
      {
        part_number: 3,
        title: 'Part 3: Academic Discussion',
        instructions: 'Answer the questions according to the speaker.',
        audio_url: raw.part3_audio_url || raw.audio_url || '',
        questions: raw.part3_questions || [],
      },
      {
        part_number: 4,
        title: 'Part 4: Academic Lecture',
        instructions: 'Write NO MORE THAN ONE WORD for each answer.',
        audio_url: raw.part4_audio_url || raw.audio_url || '',
        questions: raw.part4_questions || [],
      },
    ];

    return {
      id: raw.id,
      test_code: raw.test_set_id || raw.test_code || 'IELTS-L-01',
      title: raw.title || 'Cambridge Practice Listening Test 1',
      audio_url: raw.part1_audio_url || raw.audio_url || '',
      parts,
    };
  }

  async getSpeakingTests(): Promise<IeltsSpeakingTest[]> {
    try {
      const res = await this.http.get('ielts/speaking/tests');
      return (res.data as any)?.data || [];
    } catch {
      const fallback = await this.http.get('ielts/speaking');
      return (fallback.data as any)?.data || [];
    }
  }

  async getSpeakingTest(id: number | string): Promise<IeltsSpeakingTest | null> {
    const res = await this.http.get(`ielts/speaking/tests/${id}`);
    return (res.data as any)?.data || null;
  }

  async getListeningTests(): Promise<IeltsListeningTest[]> {
    try {
      const res = await this.http.get('ielts/listening/tests');
      const list = (res.data as any)?.data || [];
      return list.map((item: any) => this.normalizeListeningTest(item));
    } catch {
      const fallback = await this.http.get('ielts/listening');
      const list = (fallback.data as any)?.data || [];
      return list.map((item: any) => this.normalizeListeningTest(item));
    }
  }

  async getListeningTest(id: number | string): Promise<IeltsListeningTest | null> {
    const res = await this.http.get(`ielts/listening/tests/${id}`);
    const data = (res.data as any)?.data;
    return data ? this.normalizeListeningTest(data) : null;
  }

  async getPresignedAudioUploadUrl(params: {
    fileName: string;
    fileType?: string;
    folder?: string;
  }): Promise<{ uploadUrl: string; key: string; publicUrl: string; isS3: boolean }> {
    const res = await this.http.post('ielts/audio/presign', params);
    return (res.data as any)?.data;
  }

  async uploadAudioToR2(
    fileUri: string,
    fileType: string = 'audio/m4a',
    folder: string = 'ielts-part2-audio'
  ): Promise<{ publicUrl: string; key: string }> {
    const fileName = `part2_${Date.now()}.m4a`;
    const presigned = await this.getPresignedAudioUploadUrl({
      fileName,
      fileType,
      folder,
    });

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadRes = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload audio to Cloudflare R2 (${uploadRes.status})`);
    }

    return {
      publicUrl: presigned.publicUrl,
      key: presigned.key,
    };
  }

  async startTestSession(data: {
    speaking_test_id?: number;
    listening_test_id?: number;
    testSetId?: string;
    session_type?: 'speaking' | 'listening' | 'full_mock';
    sessionMode?: string;
  }): Promise<IeltsTestSession> {
    const res = await this.http.post('ielts/sessions/start', data);
    return (res.data as any)?.data;
  }

  async savePart2Submission(
    sessionId: number,
    data: {
      audioUrl: string;
      summary?: string;
      transcript?: string;
      childSessionId?: number;
    }
  ): Promise<IeltsTestSession> {
    const res = await this.http.post(`ielts/sessions/${sessionId}/part2`, data);
    return (res.data as any)?.data;
  }

  async updateSessionPart(
    sessionId: number,
    data: {
      current_part: number;
      child_session_id?: number;
      part2_recording_url?: string;
      audioUrl?: string;
      part_duration_seconds?: number;
      listening_answers?: Record<string, string>;
    }
  ): Promise<IeltsTestSession> {
    const res = await this.http.post(`ielts/sessions/${sessionId}/update-part`, data);
    return (res.data as any)?.data;
  }

  async completeTestSession(
    sessionId: number,
    data?: {
      listening_answers?: Record<string, string>;
      listening_score?: number;
      overall_band?: number;
    }
  ): Promise<IeltsTestSession> {
    const res = await this.http.post(`ielts/sessions/${sessionId}/complete`, data || {});
    return (res.data as any)?.data;
  }

  async getPart3Context(sessionId: number): Promise<{
    part1_highlights?: string;
    part1_transcript?: string;
    part2_topic?: string;
    part2_summary?: string;
    part2_transcript?: string;
    part3_theme?: string;
    part3_context_prompt?: string;
    part3_example_questions?: string[];
  }> {
    const res = await this.http.get(`ielts/sessions/${sessionId}/context`);
    return (res.data as any)?.data;
  }

  async submitListeningTest(data: {
    testSetId: string;
    answers: Record<string, string>;
  }): Promise<{
    testSession: any;
    score: number;
    totalQuestions: number;
    band: number;
    detailedResults: Array<{
      question_number: number;
      user_answer: string;
      correct_answer: string;
      is_correct: boolean;
    }>;
  }> {
    const res = await this.http.post('ielts/listening/submit', data);
    return (res.data as any)?.data;
  }
}

export const ieltsService = new IeltsService();

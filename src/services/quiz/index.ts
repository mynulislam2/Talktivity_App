import { httpService } from '../http/httpservice';
import { API_URLS } from '../urls';
import { AiService } from '@/services/ai';
import type { QuizQuestion, QuizType, QuizOption } from '@/types/quiz';

type RawAIQuestion = Record<string, any>;

function toId(prefix: string, idx: number) {
  return `${prefix}-${idx + 1}`;
}

function normalizeOptions(raw: any, questionIndex: number): QuizOption[] {
  const arr = Array.isArray(raw) ? raw : raw?.options;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((opt: any, idx: number) => {
      if (typeof opt === 'string') {
        return { id: toId(`opt-${questionIndex}`, idx), text: opt };
      }
      const text = String(opt?.text ?? opt?.option ?? opt?.label ?? '').trim();
      const id = String(
        opt?.id ?? opt?.key ?? toId(`opt-${questionIndex}`, idx)
      );
      return { id, text: text || id };
    })
    .filter((o) => Boolean(o.text));
}

function normalizeCorrectOptionIds(raw: any, options: QuizOption[]): string[] {
  const correct =
    raw?.correctOptionIds ??
    raw?.correct_option_ids ??
    raw?.correct_answer_ids ??
    raw?.correctAnswers ??
    raw?.correct_answers ??
    raw?.answer;

  if (Array.isArray(correct)) {
    // If array contains option ids, return as-is; if it contains option text, map to ids.
    const asStrings = correct.map(String);
    const idSet = new Set(options.map((o) => String(o.id)));
    const looksLikeIds = asStrings.every((v) => idSet.has(v));
    if (looksLikeIds) return asStrings;

    const mapped = asStrings
      .map((txt) => {
        const match = options.find(
          (o) => o.text.trim().toLowerCase() === txt.trim().toLowerCase()
        );
        return match?.id || null;
      })
      .filter(Boolean) as string[];
    return mapped;
  }
  if (typeof correct === 'string' || typeof correct === 'number') {
    const v = String(correct);
    const match = options.find(
      (o) =>
        String(o.id) === v ||
        o.text.trim().toLowerCase() === v.trim().toLowerCase()
    );
    return match ? [match.id] : [v];
  }

  // Some AI responses return correct answer as option text; map that back to id if possible.
  const correctText = raw?.correct_answer ?? raw?.correctAnswer;
  if (typeof correctText === 'string') {
    const match = options.find(
      (o) => o.text.trim().toLowerCase() === correctText.trim().toLowerCase()
    );
    if (match) return [match.id];
  }

  return [];
}

function normalizeAIQuestions(raw: any[], type: QuizType): QuizQuestion[] {
  const list: RawAIQuestion[] = Array.isArray(raw) ? raw : [];

  return list
    .map((q, idx) => {
      const questionText = String(
        q?.question ?? q?.prompt ?? q?.q ?? ''
      ).trim();
      const options = normalizeOptions(q, idx);
      const correctOptionIds = normalizeCorrectOptionIds(q, options);

      return {
        id: String(q?.id ?? toId(`${type}-q`, idx)),
        type,
        question: questionText || `Question ${idx + 1}`,
        options,
        correctOptionIds,
        explanation: q?.explanation ? String(q.explanation) : undefined,
        meta: q,
      } satisfies QuizQuestion;
    })
    .filter((q) => {
      // Keep pronunciation questions even if they have no options;
      // they are handled specially by the pronunciation quiz hook.
      const rawType = String(q.meta?.type || '').toLowerCase();
      if (type === 'speaking' && rawType === 'pronunciation') {
        return true;
      }
      return q.options.length > 0;
    });
}

class QuizService {
  private ai = AiService.getInstance();

  /**
   * Preferred API: generate a speaking quiz from latest conversation (backend decides source).
   */
  async generateQuizForConversation(): Promise<{
    success: boolean;
    data: QuizQuestion[];
    error?: string;
  }> {
    const res = await this.ai.generateQuiz();
    if (!res.success)
      return {
        success: false,
        data: [],
        error: res.error || 'Failed to generate quiz',
      };
    return {
      success: true,
      data: normalizeAIQuestions(res.data || [], 'speaking'),
    };
  }

  /**
   * Preferred API: generate a listening quiz from a conversation string.
   */
  async generateListeningQuiz(
    conversation: string
  ): Promise<{ success: boolean; data: QuizQuestion[]; error?: string }> {
    const res = await this.ai.generateListeningQuiz(conversation);
    if (!res.success)
      return {
        success: false,
        data: [],
        error: res.error || 'Failed to generate listening quiz',
      };
    return {
      success: true,
      data: normalizeAIQuestions(res.data || [], 'listening'),
    };
  }

  /**
   * Legacy API (kept for compatibility): POST /quizzes/generate\n+   * Not currently used by `app/quiz` or `app/listening-quiz`.\n+   */
  async generateQuiz(data: any): Promise<any> {
    const response = await httpService.post(API_URLS.QUIZ.GENERATE, data);
    return response.data;
  }
}

export const quizService = new QuizService();

export type QuizType = 'speaking' | 'listening';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  options: QuizOption[];
  /**
   * One or more correct option ids (supports single or multi-select questions).
   */
  correctOptionIds: string[];
  explanation?: string;
  /**
   * Optional source fields from AI responses.
   */
  meta?: Record<string, any>;
}

export interface QuizSession {
  type: QuizType;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  completed: boolean;
}

export interface QuizResult {
  type: QuizType;
  score: number;
  total: number;
  completedAt: string; // ISO timestamp
}


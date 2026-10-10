export interface GrammarTopic {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  title: string;
  slug: string;
  difficulty_level?: string;
  ielts_target_band?: number | string;
  summary: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  lessons_count?: number;
  questions_count?: number;
  user_progress?: {
    lessons_completed: boolean;
    quiz_completed: boolean;
    best_quiz_score: number;
    attempts_count: number;
    last_practiced_at?: string;
  } | null;
}

export interface GrammarCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  topics: GrammarTopic[];
}

export interface GrammarLesson {
  id: number;
  topic_id: number;
  step_number: number;
  title: string;
  formula?: string;
  explanation: string;
  examples: Array<{
    sentence: string;
    highlight?: string;
    note?: string;
  }>;
  ielts_tip?: string;
  sort_order: number;
}

export interface GrammarQuizOption {
  id: number;
  question_id: number;
  option_key: string;
  option_text: string;
}

export interface GrammarQuizQuestion {
  id: number;
  topic_id: number;
  question_text: string;
  question_type: string;
  explanation?: string;
  options: GrammarQuizOption[];
}

export interface GrammarHubData {
  recommendedTopic: GrammarTopic | null;
  categories: GrammarCategory[];
  allTopics: GrammarTopic[];
  stats: {
    topics_practiced: number;
    lessons_completed_count: number;
    quizzes_completed_count: number;
    avg_quiz_score: number;
  };
}

export interface QuizSubmissionAnswer {
  questionId: number;
  selectedOptionId: number;
}

export interface QuizReviewItem {
  questionId: number;
  questionText: string;
  selectedOptionId: number | null;
  correctOptionId: number | null;
  isCorrect: boolean;
  explanation: string;
}

export interface GrammarQuizResult {
  topicId: number;
  topicSlug: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentScore: number;
  passed: boolean;
  reviewItems: QuizReviewItem[];
  progress?: any;
}

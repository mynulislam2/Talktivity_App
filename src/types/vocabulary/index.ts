/**
 * Vocabulary Types for Talktivity Mobile App
 */

export interface VocabularyTopic {
  id: number;
  slug: string;
  title: string;
  category: string;
  category_order?: number;
  display_order?: number;
  icon?: string;
  description?: string;
  is_featured?: boolean;
  total_words: number;
  practiced_words: number;
}

export interface VocabularyCategoryGroup {
  name: string;
  category_order: number;
  topics: VocabularyTopic[];
  total_words: number;
  practiced_words: number;
}

export interface VocabularyWordItem {
  id: number;
  word: string;
  ipa?: string;
  bangla_meaning: string;
  definition: string;
  example_sentence?: string;
  guided_sentence?: string;
  cefr_level?: string;
  ielts_band_label?: string;
  display_order?: number;
  is_saved: boolean;
  is_practiced: boolean;
  practice_count?: number;
  topic_slug?: string;
  topic_title?: string;
}

export type VocabularyWord = VocabularyWordItem;

export interface VocabularyHomeData {
  featured_topics: VocabularyTopic[];
  saved_words_count: number;
  daily_goal: {
    target: number;
    practiced_today: number;
  };
  stats: {
    total_topics: number;
    total_words: number;
  };
}

export interface VocabularyTopicDetailData {
  topic: VocabularyTopic;
  words: VocabularyWordItem[];
}

export interface PracticeRecordResult {
  is_practiced: boolean;
  practiced_today: number;
  topic_completed: boolean;
  topic_progress: {
    practiced: number;
    total: number;
  };
}

export interface ToggleSaveResult {
  is_saved: boolean;
  saved_words_count: number;
}

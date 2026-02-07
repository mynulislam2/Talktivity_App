/**
 * Topic Types
 * 
 * Central type definitions for topics.
 */

export interface Topic {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  prompt?: string;
  firstPrompt?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isCustom?: boolean;
  customScenarioDetails?: {
    myRole: string;
    otherRole: string;
    situation: string;
  };
  created_at?: string;
  updated_at?: string;
  categoryId?: string;
  categoryName?: string;
}

export type { TopicCategory, TopicsResponse, CreateTopicResponse } from './category';

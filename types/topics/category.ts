/**
 * Topic Category Types
 * 
 * Type definitions for topic categories and related structures.
 */

import type { Topic } from './index';

export interface TopicCategory {
  id: string;
  category_name: string;
  topics: Topic[];
  totalTopics: number;
  displayedTopics: number;
  planType: 'Basic/FreeTrial' | 'Pro';
  restricted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TopicsResponse {
  success: boolean;
  data: TopicCategory[];
  message?: string;
}

export interface CreateTopicResponse {
  success: boolean;
  data: Topic;
  message?: string;
}

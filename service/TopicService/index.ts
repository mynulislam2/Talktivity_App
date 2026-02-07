/**
 * TopicService
 * 
 * Service for managing topics API calls.
 * Handles fetching topics, getting topic details, and creating custom topics.
 */

import { httpService } from '../httpservice';
import type { Topic, TopicCategory, TopicsResponse, CreateTopicResponse } from '@/types/topics';

class TopicService {
  /**
   * Get all topics for the current user (plan-aware)
   */
  async getTopics(): Promise<TopicsResponse> {
    try {
      const response = await httpService.get('/topics');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          message: response.data.message,
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch topics');
      }
    } catch (error: any) {
      // Error fetching topics
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to load topics. Check server connection.'
      );
    }
  }

  /**
   * Get topic by ID
   */
  async getTopicById(topicId: string): Promise<Topic> {
    try {
      const response = await httpService.get(`/topics/${topicId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch topic');
      }
    } catch (error: any) {
      // Error fetching topic
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to load topic'
      );
    }
  }

  /**
   * Create a custom topic
   */
  async createTopic(category: string, topic: Topic): Promise<CreateTopicResponse> {
    try {
      const response = await httpService.post('/topics', {
        category,
        topic,
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Topic created successfully',
        };
      } else {
        throw new Error(response.data.error || 'Failed to create topic');
      }
    } catch (error: any) {
      // Error creating topic
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to create topic'
      );
    }
  }
}

export const topicService = new TopicService();
export default topicService;

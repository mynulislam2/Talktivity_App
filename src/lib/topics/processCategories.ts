/**
 * Category Processing Utilities
 *
 * Functions for processing and sorting topic categories.
 */

import type { Topic, TopicCategory } from '@/types/topics';

// Define the fixed "Create Your Own" topic
export const CUSTOM_ROLE_PLAY_TOPIC: Topic = {
  id: 'custom-role-play',
  title: 'Create Your Own',
  isCustom: true,
  prompt:
    'You are a friendly and imaginative AI who helps users create and simulate any custom role-play scenario they want. Make them feel excited and supported to explore any setting — real-life, fantasy, professional, or completely silly. Ask creative follow-ups to help shape the scene and act accordingly.',
  firstPrompt:
    "Hey there! We're about to dive into a custom role-play scenario. What kind of exciting or silly situation would you like to explore today? It's totally up to you!",
};

/**
 * Sort topics within a category
 * Custom topic first, then by updated_at/created_at (newest first)
 */
export function sortTopics(topics: Topic[]): Topic[] {
  return [...topics].sort((a, b) => {
    // Custom topic always first
    if (a.id === CUSTOM_ROLE_PLAY_TOPIC.id) return -1;
    if (b.id === CUSTOM_ROLE_PLAY_TOPIC.id) return 1;

    // Then sort by date (newest first)
    const getDate = (topic: Topic) => {
      if (topic.updated_at) return new Date(topic.updated_at);
      if (topic.created_at) return new Date(topic.created_at);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() - 1);
      return defaultDate;
    };

    const dateA = getDate(a);
    const dateB = getDate(b);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Process topic categories
 * Frontend now constructs the Role Play Scenarios category from the per-user roleplays API,
 * and prepends it before calling this function.
 *
 * This function now only:
 * - filters out legacy "Custom Category"
 * - sorts topics within each category (newest first)
 */
export function processTopicCategories(
  categories: TopicCategory[]
): TopicCategory[] {
  const filtered = categories.filter(
    (cat) => cat.category_name !== 'Custom Category'
  );

  return filtered.map((cat) => {
    const topics = sortTopics(cat.topics || []);
    return {
      ...cat,
      topics,
      totalTopics: topics.length,
      displayedTopics: topics.length,
    };
  });
}

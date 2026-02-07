/**
 * useTopicCategories Hook
 * 
 * Processes and manages topic categories (sorting, filtering, expand/collapse state).
 */

import { useMemo, useState, useCallback } from 'react';
import { processTopicCategories } from '@/lib/topics/processCategories';
import type { TopicCategory } from '@/types/topics';

export interface UseTopicCategoriesReturn {
  processedCategories: TopicCategory[];
  expandedCategories: Set<string>;
  toggleCategory: (categoryId: string) => void;
}

export function useTopicCategories(categories: TopicCategory[]): UseTopicCategoriesReturn {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const processedCategories = useMemo(() => {
    return processTopicCategories(categories);
  }, [categories]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  return {
    processedCategories,
    expandedCategories,
    toggleCategory,
  };
}

/**
 * useGroupFilters Hook
 * 
 * Manages group filtering by category and search query.
 */

import { useState, useMemo, useCallback } from 'react';
import type { Group } from '@/types/community';

export interface UseGroupFiltersReturn {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  filteredGroups: Group[];
}

export function useGroupFilters(groups: Group[], joinedGroups: number[]): UseGroupFiltersReturn {
  const [selectedCategory, setSelectedCategory] = useState('All Groups');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate categories from groups
  const categories = useMemo(() => {
    const cats = Array.from(new Set(groups.map((g) => g.category).filter(Boolean)));
    return ['All Groups', ...cats];
  }, [groups]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    // Group by lowercase name to handle duplicates
    const groupsByName = groups.reduce(
      (acc, g) => {
        const key = (g.name || '').toLowerCase().trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(g);
        return acc;
      },
      {} as Record<string, Group[]>
    );

    // Filter groups: hide all with same name if any are joined, apply category and search
    let filtered: Group[] = [];
    for (const groupList of Object.values(groupsByName)) {
      // Skip all groups with this name if any are joined
      if (groupList.some((g) => joinedGroups.includes(g.id))) continue;

      // Select the group with the most members
      const selectedGroup = groupList.sort(
        (a, b) => (b.member_count || 0) - (a.member_count || 0)
      )[0];

      // Apply category filter
      if (
        selectedCategory === 'All Groups' ||
        (selectedGroup.category || '').toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim()
      ) {
        // Apply search filter
        if (
          !searchQuery ||
          selectedGroup.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          selectedGroup.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          filtered.push(selectedGroup);
        }
      }
    }

    return filtered;
  }, [groups, selectedCategory, joinedGroups, searchQuery]);

  return {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    categories,
    filteredGroups,
  };
}

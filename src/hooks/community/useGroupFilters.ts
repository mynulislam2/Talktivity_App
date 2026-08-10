import type { Group } from '@/types/community';
import { useCallback, useMemo, useState } from 'react';

export interface UseGroupFiltersReturn {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: string[];
  filteredGroups: Group[];
}

export function useGroupFilters(
  groups: Group[],
  joinedGroups: number[]
): UseGroupFiltersReturn {
  const [selectedCategory, setSelectedCategory] = useState('All Groups');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        groups
          .map((g) => g.category)
          .filter((category): category is string => Boolean(category))
      )
    );
    return ['All Groups', ...cats];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const groupsByName = groups.reduce((acc, g) => {
      const key = (g.name || '').toLowerCase().trim();
      if (!acc[key]) acc[key] = [];
      acc[key].push(g);
      return acc;
    }, {} as Record<string, Group[]>);

    let filtered: Group[] = [];
    for (const groupList of Object.values(groupsByName)) {
      if (groupList.some((g) => joinedGroups.includes(g.id))) continue;

      const selectedGroup = groupList.sort(
        (a, b) => (b.member_count || 0) - (a.member_count || 0)
      )[0];

      if (
        selectedCategory === 'All Groups' ||
        (selectedGroup.category || '').toLowerCase().trim() ===
          selectedCategory.toLowerCase().trim()
      ) {
        if (
          !searchQuery ||
          selectedGroup.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          selectedGroup.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
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

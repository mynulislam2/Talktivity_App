/**
 * useHomeViewMode Hook
 * 
 * Manages the home page view mode state with localStorage persistence.
 * Follows the same pattern as other hooks in the codebase.
 */

import { useState, useEffect, useCallback } from 'react';
import type { HomeViewMode } from '@/types/home';
import { DEFAULT_VIEW_MODE } from '@/types/home';

const STORAGE_KEY = 'home_view_mode';

/**
 * Hook to manage home page view mode with persistence
 * @returns { viewMode, setViewMode } - Current view mode and setter function
 */
export function useHomeViewMode() {
  const [viewMode, setViewModeState] = useState<HomeViewMode>(DEFAULT_VIEW_MODE);

  // Load persisted view mode on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'today' || stored === 'timeline') {
        setViewModeState(stored);
      }
    } catch (error) {
      // Ignore localStorage errors (e.g., in private browsing)
      // Failed to load view mode from localStorage
    }
  }, []);

  // Setter that persists to localStorage
  const setViewMode = useCallback((mode: HomeViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      // Ignore localStorage errors
      // Failed to save view mode to localStorage
    }
  }, []);

  return { viewMode, setViewMode };
}

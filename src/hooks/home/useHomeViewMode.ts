import type { HomeViewMode } from '@/types/home';
import { DEFAULT_VIEW_MODE } from '@/types/home';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOME_VIEW_MODE_KEY = 'homeViewMode';

export function useHomeViewMode() {
  const [viewMode, setViewModeState] =
    useState<HomeViewMode>(DEFAULT_VIEW_MODE);

  const setViewMode = useCallback(async (mode: HomeViewMode) => {
    setViewModeState(mode);
    try {
      await AsyncStorage.setItem(HOME_VIEW_MODE_KEY, mode);
    } catch {}
  }, []);

  return { viewMode, setViewMode };
}

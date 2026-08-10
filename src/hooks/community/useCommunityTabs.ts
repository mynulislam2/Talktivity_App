import { useCallback, useEffect, useState } from 'react';

export type CommunityTab = 'inbox' | 'groups';

export interface UseCommunityTabsReturn {
  activeTab: CommunityTab;
  setActiveTab: (tab: CommunityTab) => void;
}

function normalizeTab(value: string | null): CommunityTab {
  return value === 'groups' ? 'groups' : 'inbox';
}

export function useCommunityTabs(): UseCommunityTabsReturn {
  const [activeTab, setActiveTabState] = useState<CommunityTab>('inbox');

  const setActiveTab = useCallback((tab: CommunityTab) => {
    setActiveTabState(tab);
  }, []);

  return {
    activeTab,
    setActiveTab,
  };
}

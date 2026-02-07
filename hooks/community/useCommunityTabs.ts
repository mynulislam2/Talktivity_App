/**
 * useCommunityTabs Hook
 * 
 * Manages tab state (inbox/groups) for the community page.
 */

import { useState, useCallback } from 'react';

export type CommunityTab = 'inbox' | 'groups';

export interface UseCommunityTabsReturn {
  activeTab: CommunityTab;
  setActiveTab: (tab: CommunityTab) => void;
}

export function useCommunityTabs(): UseCommunityTabsReturn {
  const [activeTab, setActiveTab] = useState<CommunityTab>('inbox');

  return {
    activeTab,
    setActiveTab,
  };
}

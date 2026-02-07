/**
 * useGroups Hook
 * 
 * Manages group-specific state including joined groups and filtering.
 */

import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectGroups, selectJoinedGroups, selectLastRead } from '@/store/slices/communitySlice';
import type { Group } from '@/types/community';

export interface UseGroupsReturn {
  groups: Group[];
  joinedGroups: number[];
  hasUnread: (group: Group) => boolean;
  isJoined: (groupId: number) => boolean;
}

export function useGroups(): UseGroupsReturn {
  const groups = useAppSelector(selectGroups);
  const joinedGroups = useAppSelector(selectJoinedGroups);
  const lastRead = useAppSelector(selectLastRead);

  const hasUnread = useMemo(() => {
    return (group: Group): boolean => {
      const lastReadAt = lastRead[String(group.id)];
      const lastMsgAt = group.last_message_at || group.updated_at || group.created_at;
      if (!lastMsgAt) return false;
      if (!lastReadAt) return true;
      return new Date(lastReadAt) < new Date(lastMsgAt);
    };
  }, [lastRead]);

  const isJoined = useMemo(() => {
    return (groupId: number): boolean => {
      return joinedGroups.includes(groupId);
    };
  }, [joinedGroups]);

  return {
    groups,
    joinedGroups,
    hasUnread,
    isJoined,
  };
}

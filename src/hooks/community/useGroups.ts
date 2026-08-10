import { hasUnreadGroup } from '@/utils/community';
import { useAppSelector } from '@/store/hooks';
import {
  selectGroups,
  selectJoinedGroups,
  selectLastRead,
} from '@/store/slices/communitySlice';
import type { Group } from '@/types/community';
import { useMemo } from 'react';

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
      return hasUnreadGroup(group, lastRead[String(group.id)]);
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

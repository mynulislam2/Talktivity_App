/**
 * CommunityTabs Component (React Native)
 * 
 * Tab switcher for Inbox and Groups views.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type CommunityTab = 'inbox' | 'groups';

export interface CommunityTabsProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
  unreadDMsCount?: number;
}

export function CommunityTabs({
  activeTab,
  onTabChange,
  unreadDMsCount = 0,
}: CommunityTabsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'inbox' && styles.tabActive]}
        onPress={() => onTabChange('inbox')}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={activeTab === 'inbox' ? '#fff' : '#d1d5db'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'inbox' && styles.tabTextActive,
            ]}
          >
            Inbox
          </Text>
          {unreadDMsCount > 0 && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
        onPress={() => onTabChange('groups')}
      >
        <View style={styles.tabContent}>
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === 'groups' ? '#fff' : '#d1d5db'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'groups' && styles.tabTextActive,
            ]}
          >
            Groups
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  tabActive: {
    backgroundColor: '#7c3aed',
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  tabTextActive: {
    color: '#fff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
});

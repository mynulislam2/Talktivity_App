import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('inbox')}>
        {activeTab === 'inbox' ? (
          <LinearGradient
            colors={['#2C5BFF', '#A45DFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeGradient}
          >
            <Ionicons name="chatbubble-outline" size={17} color="#fff" />
            <Text style={styles.activeTabText}>Inbox</Text>
            {unreadDMsCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadDMsCount}</Text>
              </View>
            )}
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTabContent}>
            <Ionicons
              name="chatbubble-outline"
              size={17}
              color="rgba(255,255,255,0.72)"
            />
            <Text style={styles.inactiveTabText}>Inbox</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('groups')}
      >
        {activeTab === 'groups' ? (
          <LinearGradient
            colors={['#2C5BFF', '#A45DFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeGradient}
          >
            <Ionicons name="people-outline" size={17} color="#fff" />
            <Text style={styles.activeTabText}>Groups</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTabContent}>
            <Ionicons
              name="people-outline"
              size={17}
              color="rgba(255,255,255,0.72)"
            />
            <Text style={styles.inactiveTabText}>Groups</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#162657',
    padding: 6,
    shadowColor: 'rgba(5,8,24,0.22)',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 8,
  },
  tab: {
    flex: 1,
  },
  activeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: 'rgba(176,199,255,0.55)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 2,
  },
  activeTabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  inactiveTabText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    fontWeight: '500',
  },
  unreadBadge: {
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});

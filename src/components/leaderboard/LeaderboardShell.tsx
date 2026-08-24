/**
 * LeaderboardShell Component (React Native)
 *
 * Shell layout for leaderboard page — matches frontend design.
 * Uses a dark theme with gradient accents, scope selector, and user rank card.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { LeaderboardType } from '@/types/leaderboard';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

const SCOPE_OPTIONS: { value: LeaderboardType; label: string }[] = [
  { value: 'overall', label: 'Global' },
  { value: 'weekly', label: 'This Week' },
];

export interface LeaderboardShellProps {
  currentType: LeaderboardType;
  onTypeChange: (type: LeaderboardType) => void;
  userPositionSlot: React.ReactNode;
  listSlot: React.ReactNode;
}

export function LeaderboardShell({
  currentType,
  onTypeChange,
  userPositionSlot,
  listSlot,
}: LeaderboardShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const currentScopeLabel = useMemo(
    () => SCOPE_OPTIONS.find((o) => o.value === currentType)?.label || 'Global',
    [currentType]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Position Slot */}
        {userPositionSlot}

        {/* Scope Selector */}
        <View style={styles.scopeSection}>
          <View style={styles.scopeSelector}>
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={styles.scopeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy" size={24} color="#fbbf24" />
              <Text style={styles.scopeText}>{currentScopeLabel}</Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard List */}
        {listSlot}
      </ScrollView>

      {/* Scope Dropdown Modal */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable
            style={styles.dropdown}
            onPress={(e) => e.stopPropagation()}
          >
            {SCOPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.dropdownItem,
                  currentType === option.value && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  onTypeChange(option.value);
                  setMenuOpen(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    currentType === option.value &&
                      styles.dropdownItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: spacing['3xl'],
  },
  scopeSection: {
    marginBottom: 20,
  },
  scopeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scopeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  scopeText: {
    fontSize: 28,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    letterSpacing: 0.14,
    color: '#fff',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: 172,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: '#20233f',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
    elevation: 10,
  },
  dropdownItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#2949ff',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: 'rgba(255,255,255,0.7)',
  },
  dropdownItemTextActive: {
    color: '#fff',
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});

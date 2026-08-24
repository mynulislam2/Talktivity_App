/**
 * GroupFilters Component (React Native)
 *
 * Category filter dropdown and search toggle.
 * Matches talktivity_frontend/components/community/GroupFilters.tsx
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';

export interface GroupFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
}

export function GroupFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showSearch,
  onToggleSearch,
}: GroupFiltersProps) {
  const dropdownItems = categories.map((cat) => ({
    label: cat,
    value: cat,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Groups</Text>
        <View style={styles.headerRight}>
          <Dropdown
            data={dropdownItems}
            value={selectedCategory}
            onChange={(item: any) => onCategoryChange(item.value)}
            labelField="label"
            valueField="value"
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            itemContainerStyle={styles.dropdownItemContainer}
            itemTextStyle={styles.dropdownItemText}
            selectedTextStyle={styles.dropdownSelectedText}
            activeColor="rgba(41,73,255,0.3)"
            placeholder=""
            iconColor="#C6C6C6"
            iconStyle={styles.dropdownIcon}
            renderRightIcon={() => (
              <Ionicons name="chevron-down" size={12} color="#C6C6C6" />
            )}
            maxHeight={200}
            dropdownPosition="auto"
          />
          <TouchableOpacity
            style={styles.searchToggle}
            onPress={onToggleSearch}
            activeOpacity={0.7}
          >
            {showSearch ? (
              <Ionicons name="close" size={16} color="#C6C6C6" />
            ) : (
              <Ionicons name="search" size={16} color="#C6C6C6" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={16}
            color="#C6C6C6"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor="#C6C6C6"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange('')}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={14} color="#C6C6C6" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 30.8,
    letterSpacing: -0.03,
    color: '#FDFDFD',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdown: {
    height: 32,
    minWidth: 110,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: '#20233f',
    marginTop: 4,
  },
  dropdownItemContainer: {
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  dropdownItemText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  dropdownSelectedText: {
    fontSize: 12,
    color: '#fff',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
});

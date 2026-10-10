import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useResponsive } from '@/theme/responsive';

export interface IeltsTabItem {
  id: string | number;
  label: string;
  isCompleted?: boolean;
  disabled?: boolean;
}

interface IeltsPillTabsProps {
  tabs: IeltsTabItem[];
  activeId: string | number;
  onSelect: (id: any) => void;
  locked?: boolean;
}

export const IeltsPillTabs: React.FC<IeltsPillTabsProps> = ({
  tabs,
  activeId,
  onSelect,
  locked = false,
}) => {
  const { s } = useResponsive();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const isDisabled = tab.disabled || (locked && !isActive);

        return (
          <TouchableOpacity
            key={String(tab.id)}
            onPress={() => onSelect(tab.id)}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
              styles.tab,
              isActive && styles.tabActive,
              isDisabled && styles.tabDisabled,
            ]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
            {tab.isCompleted && (
              <Feather
                name="check-circle"
                size={s(13)}
                color="#34D399"
                style={{ marginLeft: 4 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tab: {
    flex: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'transparent',
    paddingHorizontal: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  tabDisabled: {
    opacity: 0.4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default IeltsPillTabs;

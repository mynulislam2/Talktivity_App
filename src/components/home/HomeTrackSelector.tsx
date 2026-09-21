import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useResponsive } from '@/theme/responsive';

export type IeltsHomeMode = 'daily' | 'drills' | 'mock_exam';

interface HomeTrackSelectorProps {
  currentMode: IeltsHomeMode;
  onSelectMode: (mode: IeltsHomeMode) => void;
}

export const HomeTrackSelector: React.FC<HomeTrackSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const { s } = useResponsive();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          currentMode === 'daily' && styles.tabButtonActive,
        ]}
        onPress={() => onSelectMode('daily')}
        activeOpacity={0.8}
      >
        <Feather
          name="calendar"
          size={s(14)}
          color={currentMode === 'daily' ? '#fff' : '#8E8E93'}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            currentMode === 'daily' && styles.tabTextActive,
          ]}
        >
          Daily Plan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          currentMode === 'drills' && styles.tabButtonActive,
        ]}
        onPress={() => onSelectMode('drills')}
        activeOpacity={0.8}
      >
        <Feather
          name="target"
          size={s(14)}
          color={currentMode === 'drills' ? '#fff' : '#8E8E93'}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            currentMode === 'drills' && styles.tabTextActive,
          ]}
        >
          IELTS Drills
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          currentMode === 'mock_exam' && styles.tabButtonActive,
        ]}
        onPress={() => onSelectMode('mock_exam')}
        activeOpacity={0.8}
      >
        <Feather
          name="award"
          size={s(14)}
          color={currentMode === 'mock_exam' ? '#fff' : '#8E8E93'}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            currentMode === 'mock_exam' && styles.tabTextActive,
          ]}
        >
          Mock Exam
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type IeltsHomeMode = 'daily' | 'drills' | 'mock_exam';

interface HomeTrackSelectorProps {
  currentMode: IeltsHomeMode;
  onSelectMode: (mode: IeltsHomeMode) => void;
}

export const HomeTrackSelector: React.FC<HomeTrackSelectorProps> = ({
  currentMode,
  onSelectMode,
}) => {

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
        <Text
          style={[
            styles.tabText,
            currentMode === 'daily' && styles.tabTextActive,
          ]}
        >
          Foundation
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

/**
 * Today's Report Card Component (React Native)
 *
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface ReportProps {
  completed: boolean;
}

export const Report: React.FC<ReportProps> = ({ completed }) => {
  const navigation = useNavigation();

  const handleViewReport = () => {
    if (completed) {
      // Navigate to Today's Report screen
      (navigation as any).navigate('LearningStack', {
        screen: 'TodaysReportScreen',
      });
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.timelineDot, completed && styles.timelineDotCompleted]}
      />
      <View
        style={[styles.cardContent, !completed && styles.cardContentLocked]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Today's Report</Text>
          {completed && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
          )}
        </View>
        <Text style={styles.cardDescription}>
          {completed
            ? "Get your detailed performance report for today's activities"
            : "Complete all today's activities to unlock your report"}
        </Text>
        <TouchableOpacity
          style={[
            styles.actionButton,
            !completed && styles.actionButtonDisabled,
          ]}
          onPress={handleViewReport}
          disabled={!completed}
        >
          <Text style={styles.actionButtonText}>
            {completed ? 'View Report' : 'Complete Activities First'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  timelineDotCompleted: {
    backgroundColor: colors.success,
  },
  cardContent: {
    marginLeft: spacing.xl,
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContentLocked: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    color: colors.white,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
});

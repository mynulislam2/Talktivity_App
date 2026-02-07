/**
 * Step 3 - Speaking Feelings
 * 
 * Custom component with emotion-focused card layout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { StepOption } from '../../../types/onboarding/steps';

interface StepSpeakingFeelingsProps {
  value: string | null;
  options: StepOption[];
  onSelect: (optionId: string) => void;
}

export const StepSpeakingFeelings: React.FC<StepSpeakingFeelingsProps> = ({
  value,
  options,
  onSelect,
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.cardsContainer}>
        {options.map((option) => {
          const isSelected = value === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              {/* Icon circle */}
              <View style={[
                styles.iconCircle,
                isSelected && styles.iconCircleSelected,
              ]}>
                <Text style={styles.emotionIcon}>{option.icon}</Text>
              </View>

              {/* Text */}
              <Text
                style={[
                  styles.cardText,
                  isSelected && styles.cardTextSelected,
                ]}
              >
                {option.text}
              </Text>

              {/* Checkmark on selection */}
              {isSelected && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.explanation}>
        <Ionicons name="information-circle" size={16} color={colors.primary} />
        <Text style={styles.explanationText}>
          Your answer helps us tailor conversations to build your confidence
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f8ff',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  emotionIcon: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 20,
  },
  cardTextSelected: {
    color: colors.primary,
  },
  checkmarkContainer: {
    marginLeft: spacing.md,
  },
  explanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: spacing.md,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    lineHeight: 18,
  },
});

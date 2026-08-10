/**
 * Step 3 - Speaking Feelings
 *
 * Custom component with emotion-focused card layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              {/* Icon circle */}
              <View
                style={[
                  styles.iconCircle,
                  isSelected && styles.iconCircleSelected,
                ]}
              >
                <Text style={styles.emotionIcon}>{option.icon}</Text>
              </View>

              {/* Text */}
              <Text
                style={[styles.cardText, isSelected && styles.cardTextSelected]}
              >
                {option.text}
              </Text>

              {/* Checkmark on selection */}
              {isSelected && (
                <View style={styles.checkmarkContainer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#6A5AE0" // blue-600
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.explanation}>
        <Ionicons
          name="information-circle"
          size={16}
          color="rgba(203, 213, 225, 1)"
        />
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 1)', // slate-700
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardSelected: {
    borderColor: '#6A5AE0', // blue-500
    backgroundColor: 'rgba(37, 99, 235, 0.3)', // blue-600/30
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleSelected: {
    backgroundColor: '#6A5AE0', // blue-600
  },
  emotionIcon: {
    fontSize: 24,
    color: '#FFFFFF', // White icon
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF', // White text
    lineHeight: 20,
  },
  cardTextSelected: {
    color: '#FFFFFF', // Keep white for selected
  },
  checkmarkContainer: {
    marginLeft: spacing.md,
  },
  explanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderRadius: 12,
    padding: spacing.md,
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)', // slate-300
    fontWeight: '500',
    lineHeight: 18,
  },
});

/**
 * Step 1 - Language Statement
 *
 * Custom component for language statement question with special button styling
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { StepOption } from '../../../types/onboarding/steps';

interface StepLanguageStatementProps {
  value: string | null;
  options: StepOption[];
  onSelect: (optionId: string) => void;
}

export const StepLanguageStatement: React.FC<StepLanguageStatementProps> = ({
  value,
  options,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.id;

          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.button, isSelected && styles.buttonSelected]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              {option.icon && <Text style={styles.icon}>{option.icon}</Text>}
              <Text
                style={[
                  styles.buttonText,
                  isSelected && styles.buttonTextSelected,
                ]}
              >
                {option.text}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#6A5AE0" // blue-600
                  style={styles.checkmark}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.hint}>
        <Ionicons name="bulb" size={16} color="rgba(203, 213, 225, 1)" />
        <Text style={styles.hintText}>
          This helps us understand your speaking challenges
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 1)', // slate-700
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  buttonSelected: {
    borderColor: '#6A5AE0', // blue-500
    backgroundColor: 'rgba(37, 99, 235, 0.3)', // blue-600/30
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF', // White icon
  },
  buttonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF', // White text
  },
  buttonTextSelected: {
    color: '#FFFFFF', // Keep white for selected
  },
  checkmark: {
    marginLeft: spacing.sm,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderRadius: 12,
    padding: spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(203, 213, 225, 1)', // slate-300
    fontWeight: '500',
    lineHeight: 18,
  },
});

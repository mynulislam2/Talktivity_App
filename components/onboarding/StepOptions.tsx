/**
 * Step Options - Renders options for single-select and multi-select steps
 * 
 * Automatically handles:
 * - Icon display if provided
 * - Selection state styling
 * - Single vs multi-select behavior
 * - Responsive grid layout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { StepOption } from '../../types/onboarding/steps';

interface StepOptionsProps {
  type: 'single-select' | 'multi-select';
  options: StepOption[];
  selectedIds: string[];
  onSelectChange: (optionId: string) => void;
}

export const StepOptions: React.FC<StepOptionsProps> = ({
  type,
  options,
  selectedIds,
  onSelectChange,
}) => {
  const isMultiSelect = type === 'multi-select';

  return (
    <ScrollView
      scrollEnabled={options.length > 8}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => onSelectChange(option.id)}
              activeOpacity={0.7}
            >
              {/* Icon (if provided) */}
              {option.icon && (
                <Text style={styles.optionIcon}>{option.icon}</Text>
              )}

              {/* Text */}
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
                numberOfLines={2}
              >
                {option.text}
              </Text>

              {/* Checkbox/Radio indicator */}
              <View style={styles.indicatorContainer}>
                {isMultiSelect ? (
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primary}
                      />
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    padding: spacing.md,
    gap: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f8ff',
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  indicatorContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

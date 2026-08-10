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
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
                        color="#6A5AE0" // blue-600
                      />
                    )}
                  </View>
                ) : (
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
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
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(51, 65, 85, 1)', // slate-700
    padding: spacing.md,
    gap: spacing.md,
  },
  optionCardSelected: {
    borderColor: '#6A5AE0', // blue-500
    backgroundColor: 'rgba(37, 99, 235, 0.3)', // blue-600/30
  },
  optionIcon: {
    fontSize: 20,
    color: '#FFFFFF', // White icon
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // White text
    lineHeight: 18,
  },
  optionTextSelected: {
    color: '#FFFFFF', // White text (keep white for selected)
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
    borderColor: 'rgba(100, 116, 139, 1)', // slate-500
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#FFFFFF', // White border when selected
    backgroundColor: '#FFFFFF', // White background when selected
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(100, 116, 139, 1)', // slate-500
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FFFFFF', // White border when selected
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6A5AE0', // blue-600
  },
});

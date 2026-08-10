/**
 * OptionsList Component (React Native)
 *
 * Displays quiz options with selection and correctness indicators.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { QuizOption } from '@/types/quiz';

export interface OptionsListProps {
  options: QuizOption[];
  selectedIds: string[];
  correctIds: string[];
  disabled: boolean;
  showCorrectness: boolean;
  onSelect: (id: string) => void;
}

export function OptionsList({
  options,
  selectedIds,
  correctIds,
  disabled,
  showCorrectness,
  onSelect,
}: OptionsListProps) {
  const selected = new Set(selectedIds);
  const correct = new Set(correctIds);

  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selected.has(opt.id);
        const isCorrect = correct.has(opt.id);
        const showGood = showCorrectness && isCorrect;
        const showBad = showCorrectness && isSelected && !isCorrect;

        return (
          <TouchableOpacity
            key={opt.id}
            disabled={disabled}
            onPress={() => onSelect(opt.id)}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
          >
            <View style={styles.optionContent}>
              <View style={styles.iconContainer}>
                {showGood ? (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                ) : showBad ? (
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                ) : (
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  />
                )}
              </View>
              <Text style={styles.optionText}>{opt.text}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    gap: 12,
  },
  option: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    borderColor: 'rgba(55, 65, 81, 0.3)',
  },
  optionSelected: {
    backgroundColor: 'rgba(31, 41, 55, 0.6)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  optionDisabled: {
    opacity: 0.7,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  radioSelected: {
    borderColor: '#7B70FF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
});

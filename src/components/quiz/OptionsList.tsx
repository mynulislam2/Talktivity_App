/**
 * OptionsList Component (React Native)
 *
 * Displays quiz options with selection and correctness indicators.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tokens } from '@/theme/tokens';
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

        const borderColor = showGood
          ? tokens.color.state.success
          : showBad
          ? tokens.color.state.danger
          : isSelected
          ? tokens.color.accent.primary
          : tokens.color.border.card;
        const backgroundColor = showGood
          ? 'rgba(35,255,122,0.10)'
          : showBad
          ? 'rgba(255,35,35,0.10)'
          : tokens.color.surface.card;
        const markerColor = showGood
          ? tokens.color.state.success
          : showBad
          ? tokens.color.state.danger
          : isSelected
          ? tokens.color.accent.primary
          : tokens.color.text.secondary;

        return (
          <TouchableOpacity
            key={opt.id}
            disabled={disabled}
            onPress={() => onSelect(opt.id)}
            style={[styles.option, { borderColor, backgroundColor }]}
          >
            <View style={styles.optionContent}>
              <View style={[styles.marker, { borderColor: markerColor }]}>
                {isSelected || isCorrect ? (
                  <View style={[styles.markerPip, { backgroundColor: markerColor }]} />
                ) : null}
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
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marker: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPip: {
    width: 6,
    height: 6,
    borderRadius: 2,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500', fontFamily: 'Poppins-Medium',
    color: tokens.color.text.primary,
    lineHeight: 22,
  },
});

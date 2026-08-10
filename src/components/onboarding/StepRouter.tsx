/**
 * Step Router - Renders the appropriate step component based on step type
 *
 * Handles:
 * - single-select: Radio button style selection
 * - multi-select: Checkbox style multiple selections
 * - custom: Special handling for specific steps
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { StepDefinition } from '../../types/onboarding/steps';
import { UserSelections } from '../../types/onboarding/selections';
import { StepOptions } from './StepOptions';
import { StepLanguageStatement } from './steps/StepLanguageStatement';
import { StepSpeakingFeelings } from './steps/StepSpeakingFeelings';

interface StepRouterProps {
  step: StepDefinition;
  selections: UserSelections;
  tempSelections?: Record<string, any>;
  onSingleSelect: (value: string) => void;
  onMultiToggle: (value: string) => void;
}

export const StepRouter: React.FC<StepRouterProps> = ({
  step,
  selections,
  tempSelections,
  onSingleSelect,
  onMultiToggle,
}) => {
  // Get current value for this step
  const currentValue = useMemo(() => {
    return selections[step.field] || null;
  }, [selections, step.field]);

  // Handle custom step types
  if (step.type === 'custom') {
    // Step 1: Language statement (special button prompt layout)
    if (step.id === 1) {
      return (
        <StepLanguageStatement
          value={currentValue as string | null}
          options={step.options || []}
          onSelect={onSingleSelect}
        />
      );
    }

    // Step 3: Speaking feelings (specialized card layout)
    if (step.id === 3) {
      return (
        <StepSpeakingFeelings
          value={currentValue as string | null}
          options={step.options || []}
          onSelect={onSingleSelect}
        />
      );
    }

    // Default custom: treat as single-select
    return (
      <StepOptions
        type="single-select"
        options={step.options || []}
        selectedIds={
          currentValue ? ([currentValue] as unknown as string[]) : []
        }
        onSelectChange={onSingleSelect}
      />
    );
  }

  // Handle single-select steps
  if (step.type === 'single-select') {
    return (
      <StepOptions
        type="single-select"
        options={step.options || []}
        selectedIds={
          currentValue ? ([currentValue] as unknown as string[]) : []
        }
        onSelectChange={onSingleSelect}
      />
    );
  }

  // Handle multi-select steps
  if (step.type === 'multi-select') {
    // For multi-select, use tempSelections if available, otherwise use selections
    const multiValue = tempSelections?.[step.field] || currentValue;
    return (
      <StepOptions
        type="multi-select"
        options={step.options || []}
        selectedIds={(multiValue as string[]) || []}
        onSelectChange={onMultiToggle}
      />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  // Styles here if needed
});

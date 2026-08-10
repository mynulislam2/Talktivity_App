/**
 * Step 0 - First Name
 *
 * Text input component for collecting user's first name
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';

interface StepFirstNameProps {
  value: string | null;
  onChange: (value: string) => void;
}

export const StepFirstName: React.FC<StepFirstNameProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={20}
          color="rgba(148, 163, 184, 0.6)"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, styles.inputWithIcon]}
          placeholder="Enter your first name"
          placeholderTextColor="rgba(148, 163, 184, 0.4)"
          value={value || ''}
          onChangeText={onChange}
          autoCapitalize="words"
          autoFocus={true}
          maxLength={100}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 12,
    backgroundColor: 'rgba(5, 1, 16, 0.6)',
    height: 56,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#F1F5F9',
    paddingHorizontal: 0,
  },
  inputWithIcon: {
    paddingLeft: 12,
  },
});

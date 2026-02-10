/**
 * RolePlayModal Component
 * 
 * Modal for creating custom roleplay scenarios.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RolePlayGenerationData } from '@/hooks/topics/useRolePlayGeneration';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

export interface RolePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: RolePlayGenerationData) => void;
  isGenerating?: boolean;
}

export function RolePlayModal({ isOpen, onClose, onStart, isGenerating = false }: RolePlayModalProps) {
  const [myRole, setMyRole] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [situation, setSituation] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    if (myRole.trim() && otherRole.trim() && situation.trim()) {
      setError('');
      onStart({ myRole, otherRole, situation });
    } else {
      setError('Please fill out all fields before starting.');
      Alert.alert('Error', 'Please fill out all fields before starting.');
    }
  };

  const handleClose = () => {
    setError('');
    setMyRole('');
    setOtherRole('');
    setSituation('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Custom Role Play</Text>
            <Pressable onPress={handleClose} disabled={isGenerating}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </Pressable>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <TextInput
                placeholder="Your Role (e.g., 'Customer')"
                placeholderTextColor="#6b7280"
                value={myRole}
                onChangeText={setMyRole}
                editable={!isGenerating}
                style={styles.input}
              />
              <Text style={styles.hint}>This is the role **you** will play.</Text>
            </View>

            <View style={styles.field}>
              <TextInput
                placeholder="Other Person's Role (e.g., 'Manager')"
                placeholderTextColor="#6b7280"
                value={otherRole}
                onChangeText={setOtherRole}
                editable={!isGenerating}
                style={styles.input}
              />
              <Text style={styles.hint}>This is the role the **AI** will play.</Text>
            </View>

            <View style={styles.field}>
              <TextInput
                placeholder="Describe the situation..."
                placeholderTextColor="#6b7280"
                value={situation}
                onChangeText={setSituation}
                editable={!isGenerating}
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isGenerating}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.startButton, isGenerating && styles.buttonDisabled]}
              onPress={handleStart}
              disabled={isGenerating}
            >
              <Text style={styles.startButtonText}>
                {isGenerating ? 'Generating...' : 'Start'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    padding: spacing.md,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  hint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

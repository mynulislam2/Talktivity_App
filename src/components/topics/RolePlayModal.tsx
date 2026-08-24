/**
 * RolePlayModal Component (React Native)
 *
 * Modal for creating custom roleplay scenarios.
 * Matches talktivity_frontend/components/topics/RolePlayModal.tsx EXACTLY.
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from '../common/GradientButton';
import type { RolePlayGenerationData } from '@/hooks/topics/useRolePlayGeneration';

export interface RolePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (data: RolePlayGenerationData) => void;
  isGenerating?: boolean;
}

export function RolePlayModal({
  isOpen,
  onClose,
  onStart,
  isGenerating = false,
}: RolePlayModalProps) {
  const [myRole, setMyRole] = useState('');
  const [otherRole, setOtherRole] = useState('');
  const [situation, setSituation] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleStart = () => {
    if (myRole.trim() && otherRole.trim() && situation.trim()) {
      setError('');
      onStart({ myRole, otherRole, situation });
    } else {
      setError('Please fill out all fields before starting.');
    }
  };

  const handleClose = () => {
    setError('');
    setMyRole('');
    setOtherRole('');
    setSituation('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Custom Role Play</Text>
            <Pressable onPress={handleClose} disabled={isGenerating} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
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

          {/* Footer with buttons */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleClose}
              disabled={isGenerating}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <GradientButton
              onPress={handleStart}
              disabled={isGenerating}
              loading={isGenerating}
              label={isGenerating ? 'Generating...' : 'Start'}
              gradientColors={['#2949ff', '#b55cff'] as const}
              style={{ flex: 1, height: 52, borderRadius: 6, minWidth: 120 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: 'rgba(17,24,39,0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  title: {
    fontSize: 18,
    fontWeight: '700', fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  field: {
    marginBottom: 12,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: '#1f2937',
    color: '#fff',
    fontSize: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  hint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3d3e50',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  startGradient: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

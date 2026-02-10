/**
 * Session Saving Overlay Component (React Native)
 * 
 * Displays a full-screen saving state when session is being saved.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SessionSaveState = 'SAVING_CONVERSATION' | 'SESSION_SAVE_FAILED' | null;

export interface SessionSavingOverlayProps {
  isVisible: boolean;
  state?: SessionSaveState;
  message?: string;
  onDismiss?: () => void;
}

export function SessionSavingOverlay({ 
  isVisible, 
  state = 'SAVING_CONVERSATION',
  message,
  onDismiss 
}: SessionSavingOverlayProps) {
  const isSaving = state === 'SAVING_CONVERSATION';
  const isFailed = state === 'SESSION_SAVE_FAILED';

  const defaultMessage = isSaving 
    ? "Saving your conversation for analysis..."
    : "Something went wrong while saving your conversation. Please contact support for assistance.";

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {isSaving && (
            <ActivityIndicator size="large" color="#fff" />
          )}
          
          {isFailed && (
            <View style={styles.iconContainer}>
              <Ionicons name="alert-circle" size={48} color="#f44" />
            </View>
          )}

          <Text style={styles.title}>
            {isSaving ? "Saving Conversation" : "Save Failed"}
          </Text>

          <Text style={[styles.message, isFailed && styles.errorMessage]}>
            {message || defaultMessage}
          </Text>

          {isFailed && (
            <View style={styles.failedActions}>
              <Text style={styles.helpText}>
                Need help? Contact us at support@talktivity.app
              </Text>
              {onDismiss && (
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onDismiss}
                >
                  <Text style={styles.dismissButtonText}>Close</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    maxWidth: 300,
  },
  errorMessage: {
    color: '#faa',
  },
  failedActions: {
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  dismissButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

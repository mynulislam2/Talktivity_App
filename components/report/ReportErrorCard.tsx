/**
 * ReportErrorCard Component (React Native)
 * 
 * Error state with retry option.
 * Matches Next.js implementation.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface ReportErrorCardProps {
  error: string | null;
  title?: string;
  onRetry?: () => void;
  onStartCall?: () => void;
}

export function ReportErrorCard({ error, title, onRetry, onStartCall }: ReportErrorCardProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleStartCall = () => {
    if (onStartCall) {
      onStartCall();
    }
  };

  const shouldShowStartCall = error?.includes("No conversations") ||
    error?.includes("insufficient") ||
    error?.includes("needs more content") ||
    error?.includes("AI analysis failed") ||
    error?.includes("No completed call sessions");

  const getErrorMessage = () => {
    if (error?.includes("No conversations") || error?.includes("No completed call sessions")) {
      return "We couldn't analyze your conversation properly. Please try again with a longer conversation";
    }
    if (error?.includes("insufficient") || error?.includes("needs more content")) {
      return "Your conversation was too short for a detailed analysis. Try having a longer conversation to get better insights!";
    }
    if (error?.includes("AI analysis failed")) {
      return "We couldn't analyze your conversation properly. Please try again with a longer conversation.";
    }
    return "We couldn't analyze your conversation properly. Please try again with a longer conversation";
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {title || "Report Not Available"}
        </Text>
        <Text style={styles.message}>
          {getErrorMessage()}
        </Text>
        <View style={styles.actions}>
          {shouldShowStartCall && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartCall}
            >
              <Text style={styles.primaryButtonText}>Start a Conversation</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetry}
          >
            <Text style={styles.secondaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0923',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f87171',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: 'rgba(203, 213, 225, 1)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6A5AE0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#4b5563',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

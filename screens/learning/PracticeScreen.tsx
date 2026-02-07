/**
 * Practice Screen
 * 
 * Practice speaking session with AI agent
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { usePracticeSession } from '../../Hooks/usePracticeSession';
import SessionControls from '../../components/learning/SessionControls';
import StatsDisplay, { StatItem } from '../../components/learning/StatsDisplay';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PracticeScreenProps {
  navigation: any;
  route: any;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ navigation, route }) => {
  const topicId = route.params?.topicId || '1';
  const topicName = route.params?.topicName || 'Practice Session';
  
  const topic = {
    id: topicId,
    title: topicName,
    description: 'Practice your English speaking skills',
  };

  const { roomToken, isConnecting, isConnected, error, sessionTime, startSession, endSession } =
    usePracticeSession({
      sessionType: 'practice',
      topicId: topic.id,
      topic: topic.title,
      userLevel: 'beginner',
    });

  const [showTranscript, setShowTranscript] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (isConnected) {
        endSession(transcript);
      }
    };
  }, []);

  const handleStartSession = async () => {
    const success = await startSession();
    if (!success) {
      Alert.alert('Error', error || 'Failed to start session');
    }
  };

  const handleEndSession = async () => {
    Alert.alert('End Session?', 'Are you sure you want to end this practice session?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'End',
        onPress: async () => {
          const result = await endSession(transcript);
          // Navigate to report screen with session data
          if (result && result.sessionId) {
            navigation.navigate('ReportScreen', {
              sessionId: result.sessionId,
              sessionType: 'practice',
              reportData: result.reportMetrics || {
                sessionId: result.sessionId,
                sessionType: 'practice',
                timestamp: new Date().toISOString(),
                duration: sessionTime,
                wordCount: transcript.split(/\s+/).filter((w) => w).length,
                overallScore: 75,
                fluency: { score: 75, wpm: 140, clarity: 80, pace: 'normal' },
                grammar: { score: 75, totalErrors: 2, commonErrors: [], suggestions: [] },
                vocabulary: { score: 75, totalWords: transcript.split(/\s+/).length, uniqueWords: 30, newWords: [], vocabulary_level: 'intermediate' },
                discourse: { score: 75, coherence: 75, organization: 75, feedback: [] },
              },
            });
          } else {
            navigation.goBack();
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const stats: StatItem[] = [
    {
      label: 'Time Spent',
      value: `${Math.floor(sessionTime / 60)}:${(sessionTime % 60).toString().padStart(2, '0')}`,
      icon: 'timer',
      color: colors.primary,
    },
    {
      label: 'Words',
      value: transcript.split(/\s+/).filter((w) => w).length,
      icon: 'text',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{topic.title}</Text>
            <Text style={styles.subtitle}>Speaking Practice</Text>
          </View>
        </View>

        {/* Topic Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoBadge}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Practice Tips</Text>
            <Text style={styles.infoText}>
              Speak naturally and don't worry about making mistakes. The AI will provide feedback after the session.
            </Text>
          </View>
        </View>

        {/* Session Status */}
        {isConnecting && (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Connecting to session...</Text>
          </View>
        )}

        {isConnected && (
          <View style={styles.statusCard}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Session Active - Speak now</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Session Controls */}
        <SessionControls
          isActive={isConnected}
          timer={sessionTime}
          onStart={handleStartSession}
          onStop={handleEndSession}
          style={styles.controls}
        />

        {/* Statistics */}
        {isConnected && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Session Stats</Text>
            <StatsDisplay stats={stats} />
          </View>
        )}

        {/* Transcript Toggle */}
        {isConnected && (
          <TouchableOpacity
            style={styles.transcriptButton}
            onPress={() => setShowTranscript(!showTranscript)}
          >
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.transcriptButtonText}>
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </Text>
            <Ionicons
              name={showTranscript ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}

        {/* Transcript Display */}
        {showTranscript && isConnected && (
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>Real-time Transcript</Text>
            <Text style={styles.transcriptText}>
              {transcript || 'Waiting for speech input...'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoBadge: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  statusCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  errorCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fee',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    marginLeft: spacing.md,
    flex: 1,
  },
  controls: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  transcriptButton: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  transcriptButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.md,
  },
  transcriptCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: spacing.md,
  },
  transcriptText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
});

export default PracticeScreen;

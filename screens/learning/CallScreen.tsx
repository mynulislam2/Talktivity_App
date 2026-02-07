/**
 * Call Screen
 * 
 * Direct call session with AI agent
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

import { useCallSession } from '../../Hooks/useCallSession';
import SessionControls from '../../components/learning/SessionControls';
import StatsDisplay, { StatItem } from '../../components/learning/StatsDisplay';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { useAppDispatch } from '@/store/hooks';
import { checkRoleplayLimit, recordRoleplaySession } from '@/store/slices/usageSlice';
import { generateCallReport } from '@/store/slices/reportSlice';

interface CallScreenProps {
  navigation: any;
  route: any;
}

const CallScreen: React.FC<CallScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const topic = route.params?.topic || 'General Conversation';
  const sessionType = route.params?.type || 'practice'; // 'practice' or 'roleplay'
  const { roomToken, isConnecting, isConnected, error, callTime, isMuted, startCall, endCall, toggleMute } =
    useCallSession();

  const [transcript, setTranscript] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Check roleplay limit on mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const result = await dispatch(checkRoleplayLimit(sessionType)).unwrap();
        if (!result.canPlay) {
          Alert.alert(
            'Daily Limit Reached',
            `You've used all your ${sessionType} time for today. Come back tomorrow!`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      } catch (err) {
        console.log('Limit check error:', err);
        // Continue anyway - server will enforce limits
      }
    };
    checkLimit();
  }, [dispatch, sessionType, navigation]);

  // Record session and generate report when call ends
  useEffect(() => {
    return () => {
      // Component is unmounting
      if (callEnded && transcript && isConnected === false) {
        // Save session to backend
        dispatch(recordRoleplaySession(sessionType)).catch(err => {
          console.log('Failed to record session:', err);
        });
        
        // Generate call report if transcript exists
        if (transcript.trim().length > 0) {
          dispatch(generateCallReport()).catch(err => {
            console.log('Failed to generate report:', err);
          });
        }
      }
    };
  }, [dispatch, callEnded, transcript, sessionType, isConnected]);

  const handleStartCall = async () => {
    const success = await startCall(topic);
    if (success) {
      setCallStarted(true);
    } else {
      Alert.alert('Error', error || 'Failed to start call');
    }
  };

  const handleEndCall = async () => {
    Alert.alert('End Call?', 'Are you sure you want to end this call?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'End',
        onPress: async () => {
          // Mark call as ended so cleanup hook can save session
          setCallEnded(true);
          
          const result = await endCall(transcript);
          // Navigate to report screen with session data
          if (result && result.sessionId) {
            navigation.navigate('ReportScreen', {
              sessionId: result.sessionId,
              sessionType: 'call',
              reportData: result.reportMetrics || {
                sessionId: result.sessionId,
                sessionType: 'call',
                timestamp: new Date().toISOString(),
                duration: callTime,
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
      label: 'Call Duration',
      value: `${Math.floor(callTime / 60)}:${(callTime % 60).toString().padStart(2, '0')}`,
      icon: 'call',
      color: colors.primary,
    },
    {
      label: 'Muted',
      value: isMuted ? 'Yes' : 'No',
      icon: isMuted ? 'mic-off' : 'mic',
      color: isMuted ? colors.error : '#4CAF50',
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
            <Text style={styles.title}>Voice Call</Text>
            <Text style={styles.subtitle}>
              {typeof topic === 'string' ? topic : topic.title}
            </Text>
          </View>
        </View>

        {/* Agent Avatar */}
        <View style={styles.agentCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#fff" />
            </View>
            {isConnected && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.agentName}>AI Assistant</Text>
          <Text style={styles.agentStatus}>
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Ready to call'}
          </Text>
        </View>

        {/* Connection Status */}
        {isConnecting && (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Dialing...</Text>
          </View>
        )}

        {isConnected && (
          <View style={styles.statusCard}>
            <View style={[styles.statusIndicator, styles.activeIndicator]} />
            <Text style={styles.statusText}>Call in Progress</Text>
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
          timer={callTime}
          isMuted={isMuted}
          onStart={handleStartCall}
          onStop={handleEndCall}
          onToggleMute={toggleMute}
          style={styles.controls}
        />

        {/* Statistics */}
        {isConnected && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Call Stats</Text>
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
              {showTranscript ? 'Hide' : 'Show'} Conversation
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
            <Text style={styles.transcriptLabel}>Conversation</Text>
            <Text style={styles.transcriptText}>
              {transcript || 'Waiting for conversation...'}
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
  agentCard: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.xs,
  },
  agentStatus: {
    fontSize: 14,
    color: '#999',
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
    marginRight: spacing.sm,
    marginBottom: spacing.md,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
    animation: 'pulse',
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

export default CallScreen;

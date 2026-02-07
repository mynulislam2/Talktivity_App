/**
 * Roleplay Screen
 * 
 * Roleplay scenario session with AI agent
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

import { useAppDispatch } from '../../store/hooks';
import { checkRoleplayLimit, recordRoleplaySession, generateCallReport } from '../../store/slices/usageSlice';
import { usePracticeSession } from '../../Hooks/usePracticeSession';
import SessionControls from '../../components/learning/SessionControls';
import StatsDisplay, { StatItem } from '../../components/learning/StatsDisplay';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface RoleplayScreenProps {
  navigation: any;
  route: any;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  yourRole: string;
  objectives: string[];
}

const mockScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Restaurant Ordering',
    description: 'Order food at a restaurant',
    context: 'You are at a restaurant and want to order food',
    yourRole: 'Customer',
    objectives: [
      'Greet the waiter',
      'Ask about menu items',
      'Place your order',
      'Ask for the bill',
    ],
  },
  {
    id: '2',
    title: 'Hotel Reservation',
    description: 'Book a hotel room',
    context: 'You want to book a room for 3 nights',
    yourRole: 'Guest',
    objectives: [
      'Ask for available rooms',
      'Inquire about prices',
      'Check in dates',
      'Complete the booking',
    ],
  },
  {
    id: '3',
    title: 'Job Interview',
    description: 'Attend a job interview',
    context: 'You are applying for an English teacher position',
    yourRole: 'Candidate',
    objectives: [
      'Introduce yourself',
      'Discuss your experience',
      'Answer questions',
      'Ask about the role',
    ],
  },
];

const RoleplayScreen: React.FC<RoleplayScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const { roomToken, isConnecting, isConnected, error, sessionTime, startSession, endSession } =
    usePracticeSession({
      sessionType: 'roleplay',
      topic: selectedScenario?.title,
      userLevel: 'intermediate',
    });

  const [transcript, setTranscript] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState(false);

  // Check roleplay limit on mount
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const result = await dispatch(checkRoleplayLimit('roleplay')).unwrap();
        if (!result.canPlay) {
          Alert.alert('Daily Limit Reached', 'You have reached your daily roleplay limit. Upgrade your plan for more sessions.');
          navigation.goBack();
        }
      } catch (err) {
        console.log('Limit check error:', err);
      }
    };
    checkLimit();
  }, [dispatch, navigation]);

  // Record session and generate report on unmount
  useEffect(() => {
    return () => {
      if (sessionEnded && transcript && isConnected === false) {
        dispatch(recordRoleplaySession('roleplay')).catch(err => console.log('Record session error:', err));
        if (transcript.trim().length > 0) {
          dispatch(generateCallReport()).catch(err => console.log('Generate report error:', err));
        }
      }
    };
  }, [dispatch, sessionEnded, transcript, isConnected]);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setHasStarted(true);
  };

  const handleStartScenario = async () => {
    const success = await startSession();
    if (success) {
      setSessionStarted(true);
    } else {
      Alert.alert('Error', error || 'Failed to start roleplay session');
    }
  };

  const handleEndScenario = async () => {
    Alert.alert('End Roleplay?', 'Are you sure you want to end this roleplay session?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'End',
        onPress: async () => {
          setSessionEnded(true);
          await endSession(transcript);
        text: 'End',
        onPress: async () => {
          await endSession(transcript);
          setHasStarted(false);
          setSelectedScenario(null);
        },
        style: 'destructive',
      },
    ]);
  };

  const stats: StatItem[] = [
    {
      label: 'Duration',
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

  if (!hasStarted) {
    // Scenario Selection
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Roleplay</Text>
            <Text style={styles.subtitle}>Choose a scenario</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scenariosScroll}
          contentContainerStyle={styles.scenariosContent}
        >
          {mockScenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              style={styles.scenarioCard}
              onPress={() => handleSelectScenario(scenario)}
              activeOpacity={0.7}
            >
              <View style={styles.scenarioHeader}>
                <View style={styles.scenarioIcon}>
                  <Ionicons name="people" size={24} color={colors.primary} />
                </View>
                <View style={styles.scenarioTitleContainer}>
                  <Text style={styles.scenarioTitle}>{scenario.title}</Text>
                  <Text style={styles.scenarioDesc}>{scenario.description}</Text>
                </View>
              </View>

              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Your Role:</Text>
                <Text style={styles.roleValue}>{scenario.yourRole}</Text>
              </View>

              <Text style={styles.scenarioContext}>{scenario.context}</Text>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
                style={styles.scenarioArrow}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Scenario Playing
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => !isConnected && (setHasStarted(false), setSelectedScenario(null))}
            style={styles.backButton}
            disabled={isConnected}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={isConnected ? '#ccc' : '#000'} 
            />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{selectedScenario?.title}</Text>
            <Text style={styles.subtitle}>Roleplay Session</Text>
          </View>
        </View>

        {/* Scenario Info */}
        <View style={styles.scenarioInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Your Role:</Text>
            <Text style={styles.infoValue}>{selectedScenario?.yourRole}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.contextLabel}>Context:</Text>
          <Text style={styles.contextText}>{selectedScenario?.context}</Text>

          <Text style={styles.objectivesLabel}>Objectives:</Text>
          {selectedScenario?.objectives.map((obj, index) => (
            <View key={index} style={styles.objectiveItem}>
              <Text style={styles.objectiveBullet}>•</Text>
              <Text style={styles.objectiveText}>{obj}</Text>
            </View>
          ))}
        </View>

        {/* Status */}
        {isConnecting && (
          <View style={styles.statusCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.statusText}>Starting roleplay...</Text>
          </View>
        )}

        {isConnected && (
          <View style={styles.statusCard}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>Roleplay Active - Interact now</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Controls */}
        <SessionControls
          isActive={isConnected}
          timer={sessionTime}
          onStart={handleStartScenario}
          onStop={handleEndScenario}
          style={styles.controls}
        />

        {/* Statistics */}
        {isConnected && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Session Stats</Text>
            <StatsDisplay stats={stats} />
          </View>
        )}

        {/* Transcript */}
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

        {showTranscript && isConnected && (
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>Conversation</Text>
            <Text style={styles.transcriptText}>
              {transcript || 'Waiting for interaction...'}
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
  // Scenario Selection Styles
  scenariosScroll: {
    flex: 1,
  },
  scenariosContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  scenarioIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  scenarioTitleContainer: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  scenarioDesc: {
    fontSize: 13,
    color: '#999',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginRight: spacing.sm,
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scenarioContext: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  scenarioArrow: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
  },
  // Scenario Playing Styles
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  scenarioInfoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: spacing.md,
  },
  contextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: spacing.sm,
  },
  contextText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  objectivesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  objectiveBullet: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  objectiveText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
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

export default RoleplayScreen;

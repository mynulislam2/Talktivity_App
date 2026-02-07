/**
 * Home Screen
 * 
 * Dashboard showing:
 * - Daily progress
 * - Time remaining
 * - Quick actions (Practice, Call, Roleplay)
 * - Recent activity
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import type { HomeScreenProps } from '../../navigation/types';
import { RootState } from '../../store';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const user = useSelector((state: RootState) => state.profile);
  const subscription = useSelector((state: RootState) => state.subscription);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.usernameText}>
            {user?.fullName || 'Learner'}
          </Text>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time Today</Text>
            <Text style={styles.statValue}>0 / 5 min</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>0 days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>Beginner</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="book" size={32} color={colors.primary} />
              <Text style={styles.actionLabel}>Practice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="call" size={32} color={colors.primary} />
              <Text style={styles.actionLabel}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="theater" size={32} color={colors.primary} />
              <Text style={styles.actionLabel}>Roleplay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="settings" size={32} color={colors.primary} />
              <Text style={styles.actionLabel}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plan Info */}
        {subscription && (
          <View style={styles.section}>
            <View style={styles.planCard}>
              <Text style={styles.planTitle}>Your Plan</Text>
              <Text style={styles.planType}>
                {subscription.planType || 'Basic'}
              </Text>
              <Text style={styles.planDesc}>
                5 minutes daily • Unlimited scenarios
              </Text>
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>View Plans</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>No activity yet</Text>
            <Text style={styles.emptyDesc}>
              Start a practice session to begin learning
            </Text>
          </View>
        </View>
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
  welcomeSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  usernameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: spacing.sm,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  planTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: spacing.sm,
  },
  planType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: spacing.sm,
  },
  planDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: spacing.md,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#ccc',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default HomeScreen;

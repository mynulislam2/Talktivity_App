import { useState, useEffect, useCallback } from 'react';
import { usageService, UsageStatus, SessionLimits, RoleplayLimits } from '@/service/UsageService';

export const useUsageTracking = () => {
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [scenarioLimits, setScenarioLimits] = useState<SessionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    sessionType: 'call' | 'practice' | 'roleplay';
    startTime: number;
  } | null>(null);

  // Fetch usage status removed (frontend no longer calls GET /usage/status)
  const fetchUsageStatus = useCallback(async () => {
    setUsageStatus(null);
    setLoading(false);
  }, []);

  // Fetch scenario limits
  const fetchScenarioLimits = useCallback(async () => {
    try {
      const limits = await usageService.checkScenarioLimit();
      setScenarioLimits(limits);
    } catch (error) {
      // Failed to fetch scenario limits
    }
  }, []);

  // Start/end session APIs removed; Python tracks usage on call end.
  const startSession = useCallback(async (_sessionType: 'call' | 'practice' | 'roleplay') => {
    return null;
  }, []);

  const endSession = useCallback(async () => {
    // No-op; server handles usage updates.
    setActiveSession(null);
    return true;
  }, []);

  // Start free trial
  const startFreeTrial = useCallback(async () => {
    try {
      const result = await usageService.startFreeTrial();
      if (result.success) {
        await fetchUsageStatus();
      }
      return result;
    } catch (error) {
      // Failed to start free trial
      return { success: false, error: 'Failed to start free trial' };
    }
  }, [fetchUsageStatus]);

  // Check roleplay limits for a section
  const checkRoleplayLimits = useCallback(async (sectionName: string): Promise<RoleplayLimits | null> => {
    try {
      return await usageService.checkRoleplayLimit(sectionName);
    } catch (error) {
      // Failed to check roleplay limits
      return null;
    }
  }, []);

  // Record roleplay session
  const recordRoleplaySession = useCallback(async (sectionName: string) => {
    try {
      return await usageService.recordRoleplaySession(sectionName);
    } catch (error) {
      // Failed to record roleplay session
      return false;
    }
  }, []);

  // Record scenario creation
  const recordScenarioCreation = useCallback(async () => {
    try {
      const success = await usageService.recordScenarioCreation();
      if (success) {
        await fetchScenarioLimits();
      }
      return success;
    } catch (error) {
      // Failed to record scenario creation
      return false;
    }
  }, [fetchScenarioLimits]);

  // Check if user can use a feature
  const canUseFeature = useCallback(async (feature: 'call' | 'practice' | 'roleplay' | 'scenario_creation'): Promise<boolean> => {
    try {
      return await usageService.canUseFeature(feature);
    } catch (error) {
      // Failed to check feature access
      return false;
    }
  }, []);

  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: number): string => {
    return usageService.formatTimeRemaining(seconds);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchUsageStatus();
    fetchScenarioLimits();
  }, [fetchUsageStatus, fetchScenarioLimits]);

  return {
    usageStatus,
    scenarioLimits,
    loading,
    activeSession,
    startSession,
    endSession,
    startFreeTrial,
    checkRoleplayLimits,
    recordRoleplaySession,
    recordScenarioCreation,
    canUseFeature,
    formatTimeRemaining,
    refreshUsageStatus: fetchUsageStatus,
    refreshScenarioLimits: fetchScenarioLimits
  };
};

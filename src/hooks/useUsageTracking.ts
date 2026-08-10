import { useState, useEffect, useCallback } from 'react';
import {
  usageService,
  UsageStatus,
  SessionLimits,
  RoleplayLimits,
} from '@/services/usage';

export const useUsageTracking = () => {
  const [usageStatus, setUsageStatus] = useState<UsageStatus | null>(null);
  const [scenarioLimits, setScenarioLimits] = useState<SessionLimits | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    sessionType: 'call' | 'practice' | 'roleplay';
    startTime: number;
  } | null>(null);

  const fetchUsageStatus = useCallback(async () => {
    setUsageStatus(null);
    setLoading(false);
  }, []);

  const fetchScenarioLimits = useCallback(async () => {
    try {
      const limits = await usageService.checkScenarioLimit();
      setScenarioLimits(limits);
    } catch (error) {
      // Failed to fetch scenario limits
    }
  }, []);

  const startSession = useCallback(
    async (_sessionType: 'call' | 'practice' | 'roleplay') => {
      return null;
    },
    []
  );

  const endSession = useCallback(async () => {
    setActiveSession(null);
    return true;
  }, []);

  const startFreeTrial = useCallback(async () => {
    try {
      const result = await usageService.startFreeTrial();
      if (result.success) {
        await fetchUsageStatus();
      }
      return result;
    } catch (error) {
      return { success: false, error: 'Failed to start free trial' };
    }
  }, [fetchUsageStatus]);

  const checkRoleplayLimits = useCallback(
    async (sectionName: string): Promise<RoleplayLimits | null> => {
      try {
        return await usageService.checkRoleplayLimit(sectionName);
      } catch (error) {
        return null;
      }
    },
    []
  );

  const recordRoleplaySession = useCallback(async (sectionName: string) => {
    try {
      return await usageService.recordRoleplaySession(sectionName);
    } catch (error) {
      return false;
    }
  }, []);

  const recordScenarioCreation = useCallback(async () => {
    try {
      const success = await usageService.recordScenarioCreation();
      if (success) {
        await fetchScenarioLimits();
      }
      return success;
    } catch (error) {
      return false;
    }
  }, [fetchScenarioLimits]);

  const canUseFeature = useCallback(
    async (
      feature: 'call' | 'practice' | 'roleplay' | 'scenario_creation'
    ): Promise<boolean> => {
      try {
        return await usageService.canUseFeature(feature);
      } catch (error) {
        return false;
      }
    },
    []
  );

  const formatTimeRemaining = useCallback((seconds: number): string => {
    return usageService.formatTimeRemaining(seconds);
  }, []);

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
    refreshScenarioLimits: fetchScenarioLimits,
  };
};

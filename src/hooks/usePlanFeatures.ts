/**
 * usePlanFeatures Hook (React Native)
 *
 * Plan-feature gates for the app.
 * Reads the active subscription's features from Redux.
 * Mirrors talktivity_frontend/Hooks/usePlanFeatures.ts
 */

import { useAppSelector } from '@/store/hooks';
import { selectCurrentSubscription } from '@/store/slices/subscriptionSlice';

function asFeaturesObject(features: any): Record<string, any> | null {
  if (!features || Array.isArray(features) || typeof features !== 'object')
    return null;
  return features as Record<string, any>;
}

export interface PlanFeaturesView {
  planType: string | null;
  features: any | null;
}

export function usePlanFeatures(): PlanFeaturesView {
  const subscriptionStatus = useAppSelector(selectCurrentSubscription) as any;
  const sub = subscriptionStatus?.subscription;
  const features = sub?.features ?? null;
  return {
    planType: sub?.plan_type ?? null,
    features,
  };
}

export interface DailyBudgetMinutes {
  practiceMinutes: number | null;
  roleplayMinutes: number | null;
  isUnlimitedPractice: boolean;
  isUnlimitedRoleplay: boolean;
}

export function useDailyBudgetMinutes(): DailyBudgetMinutes {
  const subscriptionStatus = useAppSelector(selectCurrentSubscription) as any;
  const sub = subscriptionStatus?.subscription;
  if (!sub) {
    return {
      practiceMinutes: 0,
      roleplayMinutes: 0,
      isUnlimitedPractice: false,
      isUnlimitedRoleplay: false,
    };
  }

  const features = sub.features ?? null;
  const obj = asFeaturesObject(features);

  if (sub.talk_time_minutes !== undefined || sub.max_scenarios !== undefined) {
    const practiceMinutes = sub.talk_time_minutes != null ? sub.talk_time_minutes : null;
    const roleplayMinutes = sub.max_scenarios != null ? sub.max_scenarios : null;
    return {
      practiceMinutes,
      roleplayMinutes,
      isUnlimitedPractice: sub.talk_time_minutes == null,
      isUnlimitedRoleplay: sub.max_scenarios == null,
    };
  }

  if (obj && obj.daily_seconds) {
    const ds = obj.daily_seconds;
    const practiceSec = typeof ds.practice === 'number' ? ds.practice : null;
    const roleplaySec = typeof ds.roleplay === 'number' ? ds.roleplay : null;
    return {
      practiceMinutes: practiceSec != null ? Math.floor(practiceSec / 60) : null,
      roleplayMinutes: roleplaySec != null ? Math.floor(roleplaySec / 60) : null,
      isUnlimitedPractice: practiceSec == null,
      isUnlimitedRoleplay: roleplaySec == null,
    };
  }

  return {
    practiceMinutes: 0,
    roleplayMinutes: 0,
    isUnlimitedPractice: false,
    isUnlimitedRoleplay: false,
  };
}

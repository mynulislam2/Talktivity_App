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
  practiceMinutes: number;
  roleplayMinutes: number;
  isUnlimitedRoleplay: boolean;
}

export function useDailyBudgetMinutes(): DailyBudgetMinutes {
  const subscriptionStatus = useAppSelector(selectCurrentSubscription) as any;
  const sub = subscriptionStatus?.subscription;
  const planType = sub?.plan_type ?? null;
  const features = sub?.features ?? null;
  const obj = asFeaturesObject(features);

  const isProTier =
    planType === 'Pro' ||
    (typeof planType === 'string' && planType.startsWith('International_')) ||
    planType === 'BD_1Month' ||
    planType === 'BD_3Month';
  const legacyPracticeSec = isProTier ? 600 : 300;
  const legacyRoleplaySec = isProTier ? 600 : 300;

  if (obj && obj.daily_seconds) {
    const ds = obj.daily_seconds;
    const practiceSec =
      typeof ds.practice === 'number' ? ds.practice : legacyPracticeSec;
    const combinedSec =
      typeof ds.roleplay_general_combined === 'number'
        ? ds.roleplay_general_combined
        : null;
    const roleplaySec =
      combinedSec != null
        ? combinedSec
        : typeof ds.roleplay === 'number'
        ? ds.roleplay
        : legacyRoleplaySec;
    return {
      practiceMinutes: Math.floor(practiceSec / 60),
      roleplayMinutes: Math.floor(roleplaySec / 60),
      isUnlimitedRoleplay: combinedSec != null || roleplaySec >= 5400,
    };
  }

  return {
    practiceMinutes: Math.floor(legacyPracticeSec / 60),
    roleplayMinutes: Math.floor(legacyRoleplaySec / 60),
    isUnlimitedRoleplay: false,
  };
}

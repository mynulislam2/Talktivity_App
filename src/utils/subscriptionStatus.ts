import type { SubscriptionStatus } from '@/services/subscription';

export interface UpgradeActionState {
  label: 'Upgrade' | 'Upgraded';
  canUpgrade: boolean;
}

export function getSubscriptionPlanType(
  subscription: SubscriptionStatus | null | undefined
): string {
  return (
    subscription?.subscription?.plan_type ||
    subscription?.plan?.plan_type ||
    'Free'
  );
}

export function getSubscriptionPlanLabel(planType?: string | null): string {
  if (!planType || planType === 'Free') {
    return 'Free';
  }
  return planType
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** The plan's display name (admins set it), else its readable plan_type, else "Free". */
export function getSubscriptionDisplayName(
  subscription: SubscriptionStatus | null | undefined
): string {
  const name = (subscription?.subscription as { plan_name?: string } | undefined)?.plan_name;
  return name || getSubscriptionPlanLabel(getSubscriptionPlanType(subscription));
}

export function hasActiveProSubscription(
  subscription: SubscriptionStatus | null | undefined
): boolean {
  if (!subscription?.active) return false;
  const planType = getSubscriptionPlanType(subscription);
  return planType !== 'Free' && Boolean(planType);
}

export function canUpgradeSubscription(
  subscription: SubscriptionStatus | null | undefined
): boolean {
  return !hasActiveProSubscription(subscription);
}

export function getUpgradeActionState(
  subscription: SubscriptionStatus | null | undefined
): UpgradeActionState {
  const canUpgrade = canUpgradeSubscription(subscription);
  return { label: canUpgrade ? 'Upgrade' : 'Upgraded', canUpgrade };
}

export function getUpgradeButtonLabel(
  subscription: SubscriptionStatus | null | undefined
): 'Upgrade' | 'Upgraded' {
  return getUpgradeActionState(subscription).label;
}

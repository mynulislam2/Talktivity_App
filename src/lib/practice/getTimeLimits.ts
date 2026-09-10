import type { SubscriptionStatus } from '@/services/subscription';

export interface TimeLimits {
  practice: number | null;
  roleplay: number | null;
  call: number;
}

export function getTimeLimits(
  subscription: SubscriptionStatus | null
): TimeLimits {
  const sub = subscription?.subscription as any;
  const talkMins = sub ? (sub.talk_time_minutes !== undefined ? sub.talk_time_minutes : null) : 0;
  const scenarioMins = sub ? (sub.max_scenarios !== undefined ? sub.max_scenarios : null) : 0;
  const callLimit = 90;

  return {
    practice: talkMins !== null ? talkMins * 60 : null,
    roleplay: scenarioMins !== null ? scenarioMins * 60 : null,
    call: callLimit,
  };
}

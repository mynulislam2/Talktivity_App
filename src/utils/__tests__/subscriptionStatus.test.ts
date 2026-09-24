import { getSubscriptionDisplayName } from '../subscriptionStatus';

describe('getSubscriptionDisplayName', () => {
  test('shows the admin-set plan name from /subscriptions/status', () => {
    const status: any = {
      active: true,
      subscription: { plan_type: 'BD_3Month', plan_name: 'BD 3 Month' },
    };
    expect(getSubscriptionDisplayName(status)).toBe('BD 3 Month');
  });

  test('falls back to a readable plan_type when there is no name', () => {
    const status: any = { active: true, subscription: { plan_type: 'International_Yearly' } };
    expect(getSubscriptionDisplayName(status)).toBe('International Yearly');
  });

  test('no subscription is Free', () => {
    expect(getSubscriptionDisplayName(null)).toBe('Free');
    expect(getSubscriptionDisplayName({ active: false } as any)).toBe('Free');
  });
});

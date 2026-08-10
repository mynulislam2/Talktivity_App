import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from '@expo/vector-icons/Feather';

import { FigmaPrimaryButton } from '@/components/ui/FigmaPrimaryButton';
import { getUtcToday } from '@/utils/timezoneUtils';
import { useAppSelector } from '@/store/hooks';

interface HomeDashboardScreenProps {
  practiceMinutes: string;
  onOpenTodayPlan: () => void;
  onStartGeneralPractice?: () => void;
}

function getWeekdayItems() {
  const [y, m, d] = getUtcToday().split('-').map(Number);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.UTC(y, m - 1, d + index));
    return {
      key: date.toISOString(),
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      dayNumber: date.getUTCDate(),
      isToday: index === 0,
    };
  });
}

export const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({
  practiceMinutes,
  onOpenTodayPlan,
  onStartGeneralPractice,
}) => {
  const weekdayItems = useMemo(() => getWeekdayItems(), []);
  const subscriptionState = useAppSelector((state) => state.subscription);
  const isExpired = subscriptionState?.currentSubscription?.active === false;
  const planType =
    subscriptionState?.currentSubscription?.subscription?.plan_type;
  const hasGeneralPractice =
    !isExpired &&
    (planType === 'BD_3Month' ||
    (typeof planType === 'string' && planType.startsWith('International_')));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.weekdaysRowContainer}>
        <View style={styles.weekdaysRow}>
          {weekdayItems.map((item) => (
            <View key={item.key} style={styles.weekdayItem}>
              <View
                style={[
                  styles.weekdayCircle,
                  item.isToday
                    ? styles.weekdayCircleActive
                    : styles.weekdayCircleInactive,
                ]}
              >
                {item.isToday ? (
                  <Feather
                    name="check"
                    size={16}
                    color="#fff"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Text style={styles.weekdayNumber}>{item.dayNumber}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.weekdayLabel,
                  item.isToday
                    ? styles.weekdayLabelActive
                    : styles.weekdayLabelInactive,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <LinearGradient
        colors={['rgba(210,131,255,0.23)', 'rgba(40,32,110,0.01)']}
        style={styles.todayPlanCard}
      >
        <View style={styles.todayPlanContent}>
          <Text style={styles.todayPlanTitle}>Your Today's Plan</Text>
          <Text style={styles.todayPlanDesc}>
            {practiceMinutes}-minute speaking practice on your daily topic.
          </Text>
          <FigmaPrimaryButton
            onPress={onOpenTodayPlan}
            style={styles.todayPlanButton}
            disabled={isExpired}
          >
            <Text style={styles.todayPlanButtonText}>Continue</Text>
            <Feather name="arrow-right" size={14} color="#fff" />
          </FigmaPrimaryButton>
        </View>
        <Image
          source={require('../../../assets/figma/coach/aleena_coach_intro.png')}
          style={styles.todayPlanHero}
          resizeMode="contain"
        />
      </LinearGradient>

      <View style={styles.coachSection}>
        <Text style={styles.coachSectionTitle}>Pick your Coach</Text>
        <Text style={styles.coachSectionDesc}>What are we learning today</Text>

        <View style={styles.coachCard}>
          <View style={styles.coachCardContent}>
            <View style={styles.coachCardHeader}>
              <Text style={styles.coachCardTitle}>General Practice</Text>
              {!hasGeneralPractice && (
                <View style={styles.lockChip}>
                  <Feather
                    name="lock"
                    size={14}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              )}
            </View>
            <Text style={styles.coachCardDesc}>
              Talk about anything — your coach adapts as you go
            </Text>
            <TouchableOpacity
              style={[
                styles.coachCardButton,
                !hasGeneralPractice && styles.coachCardButtonLocked,
              ]}
              onPress={onStartGeneralPractice}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.coachCardButtonText,
                  !hasGeneralPractice && styles.coachCardButtonTextLocked,
                ]}
              >
                {hasGeneralPractice ? 'Start a chat' : 'Unlock'}
              </Text>
              <Feather
                name="arrow-right"
                size={14}
                color={hasGeneralPractice ? '#fff' : 'rgba(255,255,255,0.8)'}
              />
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../../assets/figma/home/coach-vocabulary.png')}
            style={styles.coachImage}
            resizeMode="contain"
          />
        </View>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  weekdaysRowContainer: {
    marginTop: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  weekdayItem: {
    width: 38,
    alignItems: 'center',
    gap: 4,
  },
  weekdayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayCircleActive: {
    borderColor: '#5d4cff',
    backgroundColor: '#5d4cff',
  },
  weekdayCircleInactive: {
    borderColor: '#a0a0a1',
    backgroundColor: 'transparent',
  },
  weekdayNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0a0a1',
  },
  weekdayLabel: {
    fontSize: 16,
    lineHeight: 22.4,
  },
  weekdayLabelActive: {
    color: '#fff',
  },
  weekdayLabelInactive: {
    color: '#c6c6c6',
  },
  todayPlanCard: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    minHeight: 148,
    padding: 16,
    overflow: 'hidden',
  },
  todayPlanContent: {
    maxWidth: 228,
    zIndex: 1,
  },
  todayPlanTitle: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 25.3,
    letterSpacing: 0.12,
    color: '#fff',
  },
  todayPlanDesc: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 20.25,
    color: '#fff',
  },
  todayPlanButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  todayPlanButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
  },
  todayPlanHero: {
    position: 'absolute',
    bottom: -20,
    right: -18,
    width: 170,
    height: 170,
  },
  coachSection: {
    marginTop: 28,
  },
  coachSectionTitle: {
    fontSize: 24,
    fontWeight: '500',
    lineHeight: 28.8,
    letterSpacing: 0.12,
    color: '#fff',
  },
  coachSectionDesc: {
    marginTop: 6,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#c6c6c6',
  },
  coachCard: {
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    overflow: 'hidden',
    minHeight: 128,
  },
  coachCardContent: {
    justifyContent: 'space-between',
    zIndex: 1,
  },
  coachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachCardTitle: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.12,
    color: '#fff',
  },
  lockChip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 4,
  },
  coachCardDesc: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: '#c6c6c6',
    maxWidth: 220,
  },
  coachCardButton: {
    marginTop: 16,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  coachCardButtonLocked: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  coachCardButtonText: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#fff',
    fontWeight: '500',
  },
  coachCardButtonTextLocked: {
    color: 'rgba(255,255,255,0.8)',
  },
  coachImage: {
    position: 'absolute',
    bottom: 16,
    right: 6,
    width: 114,
    height: 92,
  },
});

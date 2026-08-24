import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ReportCTAButton } from '@/components/report/ReportCTAButton';
import { tokens } from '@/theme/tokens';

export interface ReportErrorCardProps {
  error: string | null;
  code?: string | null;
  title?: string;
  onRetry?: () => void;
  onStartCall?: () => void;
}

export function ReportErrorCard({
  error,
  code,
  title,
  onRetry,
  onStartCall,
}: ReportErrorCardProps) {
  const isUpgradeGate = code === 'ONBOARDING_LIMIT_EXHAUSTED';
  const isRetryGranted = code === 'CALL_RETRY_GRANTED';
  const isTooShort = code === 'TRANSCRIPT_TOO_SHORT';
  const wantsTalkMore = !isUpgradeGate && (isRetryGranted || isTooShort);

  const effectiveTitle =
    title ||
    (isUpgradeGate
      ? 'Unlock your full experience'
      : isRetryGranted
      ? 'One more try!'
      : isTooShort
      ? "Let's talk a bit more"
      : 'Something went wrong');

  const getErrorMessage = () => {
    if (isUpgradeGate) {
      return (
        error ||
        "You've used all your free test-call attempts and we couldn't capture enough speech. Choose a plan to keep practicing and unlock your full report."
      );
    }
    if (isRetryGranted) {
      return (
        error ||
        "Looks like you didn't speak much during the test call. We've given you another minute — let's try again!"
      );
    }
    if (isTooShort) {
      return (
        error ||
        "Your test call was a little too short to build a full report. Let's have a quick chat so I can hear more of your English."
      );
    }
    return (
      error ||
      'We hit a snag preparing your report. Please try again in a moment.'
    );
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text
          style={[
            s.title,
            (isUpgradeGate || isRetryGranted) && s.titlePurple,
            !(isUpgradeGate || isRetryGranted) && s.titleRed,
          ]}
        >
          {effectiveTitle}
        </Text>
        <Text style={s.message}>{getErrorMessage()}</Text>
        {isUpgradeGate && (
          <ReportCTAButton label="See Plans" onPress={() => {}} style={s.ctaSpacing} />
        )}
        {wantsTalkMore && (
          <ReportCTAButton label="Start a Conversation" onPress={onStartCall} style={s.ctaSpacing} />
        )}
        {!isUpgradeGate && !wantsTalkMore && (
          <TouchableOpacity onPress={onRetry} style={s.retryBtn}>
            <Text style={s.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.color.surface.card,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  titlePurple: { color: '#8b82ff' },
  titleRed: { color: tokens.color.state.errorText },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins',
    lineHeight: 20,
    color: tokens.color.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaSpacing: { width: '100%', marginTop: 0 },
  retryBtn: {
    width: '100%',
    height: tokens.control.height,
    borderRadius: tokens.radius.sm,
    borderWidth: 1,
    borderColor: tokens.color.border.card,
    backgroundColor: tokens.color.surface.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: { color: tokens.color.text.primary, fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});

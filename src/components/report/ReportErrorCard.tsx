import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
          <TouchableOpacity onPress={() => {}} style={s.gradientBtn}>
            <LinearGradient
              colors={['#2563eb', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.gradientFill}
            >
              <Text style={s.btnText}>See Plans</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {wantsTalkMore && (
          <TouchableOpacity onPress={onStartCall} style={s.gradientBtn}>
            <LinearGradient
              colors={['#2563eb', '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.gradientFill}
            >
              <Text style={s.btnText}>Start a Conversation</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    borderRadius: 12,
    backgroundColor: 'rgba(17,24,39,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55,65,81,0.5)',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  titlePurple: { color: '#8b82ff' },
  titleRed: { color: '#f87171' },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 24,
  },
  gradientBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  gradientFill: { paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  retryBtn: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#4b5563',
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
});

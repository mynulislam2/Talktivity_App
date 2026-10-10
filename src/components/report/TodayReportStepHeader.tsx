import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';
import { AppBackButton } from '@/components/common/AppBackButton';

export interface TodayReportStepHeaderProps {
  title: string;
  level?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  onBack?: () => void;
}

export function TodayReportStepHeader({
  title,
  onBack,
}: TodayReportStepHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.inner}>
        {onBack ? (
          <AppBackButton onPress={onBack} />
        ) : (
          <View style={s.spacer} />
        )}
        <Text style={s.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={s.spacer} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.border.hairline,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: {
    width: 42,
    height: 42,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    lineHeight: 24,
    color: tokens.color.text.primary,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';

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
          <TouchableOpacity
            onPress={onBack}
            style={s.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  spacer: {
    width: 36,
    marginRight: -4,
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

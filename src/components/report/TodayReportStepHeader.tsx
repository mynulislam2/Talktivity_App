import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/theme/tokens';

export interface TodayReportStepHeaderProps {
  title: string;
  level: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

export function TodayReportStepHeader({ title, level, iconName }: TodayReportStepHeaderProps) {
  return (
    <View style={s.header}>
      <View style={s.inner}>
        <View style={s.iconBox}>
          <Ionicons name={iconName} size={20} color="#fff" />
        </View>
        <View style={s.textWrap}>
          <Text style={s.title} numberOfLines={1}>{title}</Text>
          <Text style={s.level}>Level {level}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: tokens.color.border.hairline,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.color.surface.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600', fontFamily: 'Poppins-SemiBold',
    lineHeight: 21,
    color: tokens.color.text.primary,
  },
  level: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: tokens.color.text.secondary,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/colors';
import { spacing } from '@/styles/spacing';

interface DividerWithTextProps {
  text?: string;
}

export const DividerWithText: React.FC<DividerWithTextProps> = ({
  text = 'Or Sign in with Email',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.brand.divider,
  },
  text: {
    fontSize: 12,
    fontWeight: '400', fontFamily: 'Poppins',
    color: colors.text.primary,
    lineHeight: 17,
  },
});

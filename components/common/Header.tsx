/**
 * Header Component
 * 
 * Top header bar with back button and title
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightComponent,
  style,
  titleStyle,
}) => {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSection}>
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      {rightComponent && (
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body3,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  rightSection: {
    marginLeft: spacing.md,
  },
});

export default Header;

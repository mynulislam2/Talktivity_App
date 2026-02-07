/**
 * Settings Item Component
 * 
 * Individual setting/preference item
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

export interface SettingsItemProps {
  icon: string;
  label: string;
  description?: string;
  value?: string;
  isToggle?: boolean;
  isEnabled?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  isDanger?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  label,
  description,
  value,
  isToggle = false,
  isEnabled = false,
  onPress,
  onToggle,
  isDanger = false,
}) => {
  const handlePress = () => {
    if (!isToggle && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={isToggle}
      activeOpacity={isToggle ? 1 : 0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon as any}
          size={24}
          color={isDanger ? '#f44336' : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, isDanger && styles.labelDanger]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
        {value && !isToggle && (
          <Text style={styles.value}>{value}</Text>
        )}
      </View>

      {isToggle ? (
        <Switch
          value={isEnabled}
          onValueChange={onToggle || (() => {})}
          trackColor={{ false: '#ccc', true: colors.primary + '40' }}
          thumbColor={isEnabled ? colors.primary : '#ccc'}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#ccc"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.xs,
  },
  labelDanger: {
    color: '#f44336',
  },
  description: {
    fontSize: 12,
    color: '#999',
  },
  value: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
});

export default SettingsItem;

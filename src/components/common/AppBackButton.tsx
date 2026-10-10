import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AppBackButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}

export const AppBackButton: React.FC<AppBackButtonProps> = ({
  onPress,
  style,
  iconSize = 20,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="chevron-back" size={iconSize} color="rgba(255, 255, 255, 0.85)" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3D3E50',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppBackButton;

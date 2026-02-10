/**
 * Card Component
 * 
 * Reusable card with shadow
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { spacing } from '../../styles/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = spacing.md,
  onPress
}) => {
  const Wrapper = onPress ? (require('react-native').TouchableOpacity) : View;

  return (
    <Wrapper 
      style={[
        styles.card, 
        { padding },
        style 
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Card;

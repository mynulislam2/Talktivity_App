import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';

import { colors } from '../../styles/colors';
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
  padding = spacing.lg,
  onPress,
}) => {
  const cardStyle = [styles.card, { padding }, style];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brand.cardBorder,
  },
});

export default Card;

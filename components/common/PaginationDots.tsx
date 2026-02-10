/**
 * PaginationDots Component
 *
 * Pagination indicator for the onboarding carousel
 * Shows dots with the active one highlighted with gradient color
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';

interface PaginationDotsProps {
  totalDots: number;
  activeIndex: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({
  totalDots,
  activeIndex,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <View key={index} style={styles.dotWrapper}>
          {index === activeIndex ? (
            <LinearGradient
              colors={[colors.purple[600], colors.blue[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.activeDot}
            />
          ) : (
            <View style={styles.inactiveDot} />
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dotWrapper: {
    width: 32,
    height: 8,
  },
  activeDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate[700],
  },
});

export default PaginationDots;

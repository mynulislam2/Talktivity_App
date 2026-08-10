/**
 * Container Component
 *
 * Main content container with consistent padding
 */

import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';

import { spacing } from '../../styles/spacing';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  scrollable?: boolean;
  backgroundColor?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = spacing.lg,
  scrollable = false,
  backgroundColor = '#fff',
}) => {
  const containerStyle = [
    styles.container,
    { padding, backgroundColor },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView style={containerStyle} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Container;

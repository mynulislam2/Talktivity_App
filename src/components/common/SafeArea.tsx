/**
 * SafeArea Component
 *
 * Wrapper for safe area with optional background color
 */

import React from 'react';
import {
  SafeAreaView as RNSafeAreaView,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  style,
  backgroundColor = '#fff',
}) => {
  return (
    <RNSafeAreaView style={[styles.container, { backgroundColor }, style]}>
      {children}
    </RNSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeArea;

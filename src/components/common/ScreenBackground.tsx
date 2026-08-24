import React from 'react';
import { type ViewStyle } from 'react-native';
import { AppBackground } from './AppBackground';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Kept for its existing importers; delegates to the canonical AppBackground. */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, style }) => (
  <AppBackground style={style}>{children}</AppBackground>
);

export default ScreenBackground;

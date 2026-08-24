import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { tokens } from '../../theme/tokens';

interface AppBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Intrinsic aspect of the gradient artwork (the web's gradient.svg viewBox). */
const GRADIENT_W = 393;
const GRADIENT_H = 852;

/**
 * The app-wide background: the base colour plus the web's gradient.
 *
 * `assets/gradient-web.png` is the web app's own `gradient.svg` rendered in a
 * browser exactly as `LayoutWrapper` paints it, so the two apps show the same
 * pixels. The SVG could not be ported directly: its entire appearance comes
 * from five `feGaussianBlur(stdDeviation=100)` filters, and react-native-svg's
 * filter support is unreliable across platforms. Rendering it once and shipping
 * the result bakes the blur into the asset.
 *
 * Sizing deliberately derives from screen WIDTH, mirroring the web's
 * `background-size: 100% auto; background-position: center top`. Anything that
 * sizes from the container instead (absoluteFill, flex) stretches the gradient
 * on scrollable screens, because there the container is taller than the
 * viewport. Below the artwork the base colour continues, exactly as on the web.
 *
 * Use this rather than a per-screen helper: five screens previously declared a
 * local `GradientBackground` that returned a transparent View and painted
 * nothing at all.
 */
export const AppBackground: React.FC<AppBackgroundProps> = ({ children, style }) => {
  const { width } = useWindowDimensions();

  return (
    <View testID="app-background" style={[styles.root, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Image
          testID="app-background-gradient"
          source={require('../../../assets/gradient-web.png')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width,
            height: width * (GRADIENT_H / GRADIENT_W),
          }}
          resizeMode="cover"
        />
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.color.bg.screen,
  },
});

export default AppBackground;

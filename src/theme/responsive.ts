/**
 * Screen-size adaptation helpers.
 *
 * Every screen in this app was laid out against the Figma frame the web app
 * uses: 393 x 852pt. On a Pixel 9 (412pt wide) that leaves slack, so nothing
 * looked wrong during development. On a 360pt phone the same fixed paddings,
 * gaps and icon sizes eat the row, text loses the width it needs, and words
 * break mid-syllable ("Lear / ning / Time").
 *
 * These helpers exist for the parts of a layout that are genuinely fixed —
 * an avatar, a day chip, a decorative icon, a card's own padding. Text should
 * NOT be sized through here as a substitute for a real constraint: give the
 * label `flex: 1` / `minWidth: 0` / `numberOfLines` so it can use whatever
 * width is actually left. Scaling is the fallback for the pixels that cannot
 * flex, not a replacement for flexbox.
 *
 * Two deliberate limits:
 *
 * - The factor never exceeds 1. Large phones keep the design's real sizes;
 *   growing them would make the app look zoomed on a tablet.
 * - The factor never drops below MIN_FACTOR. Below that, tap targets stop
 *   meeting the 44pt guidance and icons turn to mush; a layout that still
 *   does not fit at 0.82 has a constraint bug that scaling would only hide.
 */
import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

/** The frame the UI was designed against (matches the web's gradient.svg). */
export const BASE_WIDTH = 393;
export const BASE_HEIGHT = 852;

const MIN_FACTOR = 0.82;
const MAX_FACTOR = 1;

/** Phones at or below this width need the compact treatment. */
export const NARROW_WIDTH = 380;
/** Phones at or below this height cannot afford the full vertical rhythm. */
export const SHORT_HEIGHT = 720;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const currentWidth = () => Dimensions.get('window').width;

/** How much narrower this screen is than the design frame, clamped. */
export function widthFactor(width: number = currentWidth()): number {
  return clamp(width / BASE_WIDTH, MIN_FACTOR, MAX_FACTOR);
}

/**
 * Scale a fixed dimension with the screen width, snapped to the device's
 * pixel grid so 1px borders and circles stay crisp.
 */
export function scale(size: number, width?: number): number {
  return PixelRatio.roundToNearestPixel(size * widthFactor(width));
}

/**
 * Scale only part of the way. Padding and gaps read as broken when they
 * collapse fully, so shrink them at half rate by default.
 */
export function moderateScale(size: number, factor = 0.5, width?: number): number {
  return PixelRatio.roundToNearestPixel(size + (size * widthFactor(width) - size) * factor);
}

/**
 * Font sizes. Shrinks more gently than a raw scale — a 24pt title dropping to
 * 20pt on a 360pt phone reads as a different design, 22pt reads as the same
 * one. Rounded to a whole point because fractional font sizes render
 * inconsistently across Android OEMs.
 */
export function fontSize(size: number, width?: number): number {
  return Math.round(size + (size * widthFactor(width) - size) * 0.65);
}

export function isNarrow(width: number = currentWidth()): boolean {
  return width <= NARROW_WIDTH;
}

/**
 * The largest OS "Font size" / "Display size" setting the layouts can absorb.
 *
 * Android lets a user push text to 1.3x-2.0x. At those multipliers a row that
 * fits exactly at 1.0x cannot fit at all, and RN's only recourse is to wrap
 * inside a word. Capping at 1.2 keeps the accessibility win (text really does
 * get bigger) while leaving the layouts solvable. Applied globally by
 * `applyGlobalTextScaling`.
 */
export const MAX_FONT_SCALE = 1.2;

export default {
  BASE_WIDTH,
  BASE_HEIGHT,
  widthFactor,
  scale,
  moderateScale,
  fontSize,
  isNarrow,
  MAX_FONT_SCALE,
};

/**
 * Reactive variant of the helpers above. Prefer this inside components:
 * `Dimensions.get` is read once at module load, so a StyleSheet built from
 * it keeps the launch-time width after a rotation or a split-screen resize.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    narrow: isNarrow(width),
    short: height <= SHORT_HEIGHT,
    s: (size: number) => scale(size, width),
    ms: (size: number, factor?: number) => moderateScale(size, factor, width),
    fs: (size: number) => fontSize(size, width),
  };
}

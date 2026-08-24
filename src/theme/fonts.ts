import { Text as RNText, TextInput as RNTextInput } from 'react-native';

/**
 * React Native's `fontWeight` does not select a font family the way CSS
 * does — the family must be named explicitly. The app loads Poppins in five
 * weights (App.tsx) but named a family only three times, so every screen
 * rendered in the platform default. This maps weight -> loaded family.
 */
export type FontWeightish = string | number | undefined;

const FAMILY_BY_WEIGHT: Record<string, string> = {
  '300': 'Poppins-Light',
  '400': 'Poppins',
  normal: 'Poppins',
  '500': 'Poppins-Medium',
  '600': 'Poppins-SemiBold',
  '700': 'Poppins-Bold',
  bold: 'Poppins-Bold',
  '800': 'Poppins-Bold',
  '900': 'Poppins-Bold',
};

export function fontFamilyForWeight(weight: FontWeightish): string {
  if (weight === undefined || weight === null) return 'Poppins';
  return FAMILY_BY_WEIGHT[String(weight)] ?? 'Poppins';
}

const role = (fontSize: number, weight: string, ratio: number, letterSpacing?: number) => ({
  fontFamily: fontFamilyForWeight(weight),
  fontSize,
  lineHeight: Math.round(fontSize * ratio * 10) / 10,
  ...(letterSpacing === undefined ? {} : { letterSpacing }),
});

/** Roles ported from the web type scale; see spec §4.3. */
export const typeScale = {
  title: role(28, '500', 1.2, 0.14),
  heading: role(20, '500', 1.2),
  headerName: role(18, '600', 1.25),
  listTitle: role(16, '500', 1.4),
  body: role(14, '400', 1.4),
  dense: role(13, '400', 1.4),
  caption: role(12, '400', 1.4),
  microLabel: role(11, '500', 1.2),
  legal: role(10, '400', 1.4),
} as const;

/**
 * Sets the default `fontFamily` for every `Text`/`TextInput` to Poppins so
 * unstyled nodes (no `style` prop at all) still render in the loaded font
 * instead of the platform default. Any `style` prop supplied by a screen
 * still wins — RN merges style arrays left-to-right, later entries override
 * earlier ones.
 *
 * React 19 removed `defaultProps` support for plain function components,
 * but RN's `Text`/`TextInput` compile (via Flow's `component` syntax) to
 * forwardRef-wrapped components, which still honor `defaultProps` in this
 * React/React Native combination — verified by
 * `__tests__/globalFontDefaults.test.tsx` (mounts a bare, unstyled `<Text>`
 * and asserts the resolved style carries `fontFamily: 'Poppins'`, with no
 * console warning). If that combination ever changes and the assertion
 * starts failing, this call becomes a silent no-op and the per-style
 * `fontFamilyForWeight` mapping applied across screens remains the source
 * of truth for font family.
 *
 * Call once, at module load — not on every render. Re-invoking would read
 * back the previous `defaultProps.style` and nest it one level deeper each
 * time, growing an unbounded style array.
 */
export function applyGlobalFontDefaults(): void {
  const textDefaults = RNText as unknown as { defaultProps?: Record<string, unknown> };
  textDefaults.defaultProps = {
    ...(textDefaults.defaultProps ?? {}),
    style: [{ fontFamily: 'Poppins' }, textDefaults.defaultProps?.style],
  };
  const inputDefaults = RNTextInput as unknown as { defaultProps?: Record<string, unknown> };
  inputDefaults.defaultProps = {
    ...(inputDefaults.defaultProps ?? {}),
    style: [{ fontFamily: 'Poppins' }, inputDefaults.defaultProps?.style],
  };
}

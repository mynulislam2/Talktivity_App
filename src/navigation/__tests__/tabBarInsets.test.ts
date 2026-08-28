/**
 * The bottom tab bar has to clear the system navigation area without losing
 * the band its icons live in.
 *
 * The bar's height was a constant while its paddingBottom grew with
 * insets.bottom, so every point of Android 3-button nav or iOS home indicator
 * was taken out of the icon band rather than added underneath it. On a device
 * reporting a 48pt inset the band collapsed from ~67pt to ~25pt and the
 * 41.453pt icons were clipped along the bottom edge.
 */
import { tabBarLayout, TAB_ICON_BAND } from '../tabBarLayout';

// Real values, in points, as reported by react-native-safe-area-context.
const INSETS = [
  ['no system bar', 0],
  ['iOS home indicator', 34],
  ['Android gesture bar', 24],
  ['Android 3-button nav', 48],
] as const;

describe('bottom tab bar layout', () => {
  for (const short of [false, true]) {
    describe(short ? 'short phone' : 'regular phone', () => {
      it.each(INSETS)('keeps the icons intact with a %s', (_label, bottom) => {
        const { height, paddingBottom, paddingTop } = tabBarLayout(bottom, short);

        const band = height - paddingTop - paddingBottom;

        expect(band).toBeGreaterThanOrEqual(TAB_ICON_BAND);
      });

      it.each(INSETS)('sits clear of the %s', (_label, bottom) => {
        const { paddingBottom } = tabBarLayout(bottom, short);

        expect(paddingBottom).toBeGreaterThanOrEqual(bottom);
      });

      it('grows by exactly the inset rather than eating into itself', () => {
        const flat = tabBarLayout(0, short);
        const withNav = tabBarLayout(48, short);

        expect(withNav.height - flat.height).toBe(48 - flat.paddingBottom);
        expect(
          withNav.height - withNav.paddingTop - withNav.paddingBottom
        ).toBeCloseTo(flat.height - flat.paddingTop - flat.paddingBottom, 5);
      });
    });
  }
});

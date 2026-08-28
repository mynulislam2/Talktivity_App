/**
 * Geometry for the bottom tab bar.
 *
 * React Navigation treats `tabBarStyle.height` as the bar's TOTAL height,
 * padding included. The bar used to set a constant height alongside a
 * paddingBottom derived from insets.bottom, so the system navigation area was
 * subtracted from the icon band instead of being added below it — the icons
 * were clipped on every device that reports a bottom inset.
 *
 * Splitting the two apart keeps the visible band constant and lets the bar
 * grow downwards by whatever the platform needs, which is what makes it sit
 * correctly against an iOS home indicator, an Android gesture bar and Android
 * 3-button navigation alike.
 */

/** paddingTop + the icon container in MainNavigator's styles. */
export const TAB_ICON_BAND = 9.421 + 41.453;

/** Visible band, above the safe-area padding. */
const TAB_CONTENT_HEIGHT = { regular: 76, short: 62 };

/** Breathing room under the icons when the platform reports no inset. */
const MIN_BOTTOM_PADDING = { regular: 12, short: 8 };

export interface TabBarLayout {
  height: number;
  paddingTop: number;
  paddingBottom: number;
}

export function tabBarLayout(insetBottom: number, short: boolean): TabBarLayout {
  const key = short ? 'short' : 'regular';
  const paddingTop = 9.421;
  const paddingBottom = Math.max(insetBottom, MIN_BOTTOM_PADDING[key]);

  return {
    height: TAB_CONTENT_HEIGHT[key] + paddingBottom,
    paddingTop,
    paddingBottom,
  };
}

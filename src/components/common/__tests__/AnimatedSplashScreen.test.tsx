import React from 'react';
import { render } from '@testing-library/react-native';
import { Image, useWindowDimensions } from 'react-native';

import { AnimatedSplashScreen } from '../AnimatedSplashScreen';
import { tokens } from '../../../theme/tokens';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');

const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

const setScreen = (width: number, height: number) =>
  mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });

const logoStyle = (tree: ReturnType<typeof render>) => {
  const image = tree.UNSAFE_getAllByType(Image)[0];
  return Object.assign({}, ...[].concat(image.props.style).filter(Boolean));
};

/**
 * The splash used a fixed 120pt square and pointed at the squares-only mark
 * over the native splash's white background, so launch showed a white flash
 * and then a small logo. It now hands over from a dark native splash with the
 * full white lockup, sized from the screen.
 */
describe('AnimatedSplashScreen', () => {
  afterEach(() => jest.clearAllMocks());

  it('paints the same ground as the native splash, so launch does not flash', () => {
    setScreen(393, 852);

    const { getByTestId } = render(
      <AnimatedSplashScreen isAppReady={false} onFinish={() => {}} />
    );
    const style = Object.assign(
      {},
      ...[].concat(getByTestId('splash-solid').props.style).filter(Boolean)
    );

    // app.json's expo-splash-screen backgroundColor must stay this value too.
    expect(style.backgroundColor).toBe(tokens.color.bg.screen);
  });

  it('sizes the lockup from the screen instead of a fixed square', () => {
    setScreen(360, 640);
    const narrow = logoStyle(
      render(<AnimatedSplashScreen isAppReady={false} onFinish={() => {}} />)
    );

    setScreen(412, 915);
    const wide = logoStyle(
      render(<AnimatedSplashScreen isAppReady={false} onFinish={() => {}} />)
    );

    expect(narrow.width).toBeLessThan(wide.width);
  });

  it('keeps the lockup clear of the screen edges at every size', () => {
    for (const [width, height] of [
      [300, 568],
      [320, 568],
      [360, 640],
      [393, 852],
      [412, 915],
    ]) {
      setScreen(width, height);
      const style = logoStyle(
        render(<AnimatedSplashScreen isAppReady={false} onFinish={() => {}} />)
      );

      expect(style.width).toBeLessThanOrEqual(width * 0.75);
      // Below ~180pt the wordmark stops being readable on a phone.
      expect(style.width).toBeGreaterThanOrEqual(180);
    }
  });

  it('keeps the artwork undistorted', () => {
    setScreen(393, 852);

    const style = logoStyle(
      render(<AnimatedSplashScreen isAppReady={false} onFinish={() => {}} />)
    );

    // talktivity-splash-logo.png is 1013 x 281.
    expect(style.width / style.height).toBeCloseTo(1013 / 281, 3);
  });
});

/**
 * The reported "white splash" was not a bug in the component at all — the
 * component was already dark. It was that app.json's native splash was
 * #ffffff, so launch showed white, then cut to this dark view. The two have
 * to agree, and only a test can keep them agreeing.
 */
describe('native splash configuration', () => {
  const splash = (() => {
    const appConfig = require('../../../../app.json');
    const entry = appConfig.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen'
    );
    return entry[1];
  })();

  it('uses the same background as the view that replaces it', () => {
    expect(splash.backgroundColor).toBe(tokens.color.bg.screen);
    expect(splash.dark.backgroundColor).toBe(tokens.color.bg.screen);
  });

  it('shows the white lockup, not the squares-only mark', () => {
    expect(splash.image).toBe('./src/assets/images/talktivity-splash-logo.png');
    expect(splash.dark.image).toBe(splash.image);
  });

  it('does not stretch the artwork', () => {
    expect(splash.resizeMode).toBe('contain');
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';

import { applyGlobalFontDefaults, applyGlobalTextScaling } from '../fonts';
import { MAX_FONT_SCALE } from '../responsive';

/**
 * Proves (or disproves) that the Step 5 `defaultProps` mutation actually
 * takes effect under this project's React 19 / React Native combination.
 * React 19 removed `defaultProps` support for plain function components; RN
 * ships `Text`/`TextInput` as forwardRef-wrapped components, which this
 * test shows still honor it here. If this ever regresses, this test fails
 * loudly instead of the app silently keeping the platform font.
 */
describe('applyGlobalFontDefaults', () => {
  it('gives a bare, unstyled <Text> a Poppins fontFamily with no console warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockClear();
    const errorSpy = jest.spyOn(console, 'error').mockClear();

    applyGlobalFontDefaults();

    const { getByText } = render(<RNText>hello</RNText>);
    const resolvedStyle = [].concat(getByText('hello').props.style).filter(Boolean);

    expect(resolvedStyle).toContainEqual(expect.objectContaining({ fontFamily: 'Poppins' }));
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('gives a bare, unstyled <TextInput> a Poppins fontFamily', () => {
    applyGlobalFontDefaults();

    const { getByTestId } = render(<RNTextInput testID="input" />);
    const resolvedStyle = [].concat(getByTestId('input').props.style).filter(Boolean);

    expect(resolvedStyle).toContainEqual(expect.objectContaining({ fontFamily: 'Poppins' }));
  });

  it('lets an explicit style prop still win over the default', () => {
    applyGlobalFontDefaults();

    const { getByText } = render(<RNText style={{ fontFamily: 'Poppins-Bold' }}>hello</RNText>);
    const resolvedStyle = [].concat(getByText('hello').props.style).filter(Boolean);

    // The explicit style must appear after the default in the merged array
    // so RN's style flattening lets it win.
    expect(resolvedStyle[resolvedStyle.length - 1]).toEqual({ fontFamily: 'Poppins-Bold' });
  });
});

/**
 * The same `defaultProps` mechanism, used for a scalar prop. The `style`
 * caveat above (defaultProps fills only *undefined* props, so a supplied
 * `style` replaces rather than merges with the default) does not apply here:
 * no screen passes `maxFontSizeMultiplier`, so the default lands every time.
 *
 * This is what stops an Android user's enlarged "Font size" setting from
 * forcing RN to break a label inside a word on a small screen.
 */
describe('applyGlobalTextScaling', () => {
  it('caps how far the OS font setting can enlarge a <Text>', () => {
    applyGlobalTextScaling();

    const { getByText } = render(<RNText>hello</RNText>);

    expect(getByText('hello').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  it('caps a <TextInput> the same way', () => {
    applyGlobalTextScaling();

    const { getByTestId } = render(<RNTextInput testID="scaled-input" />);

    expect(getByTestId('scaled-input').props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  it('lets a component ask for a different cap', () => {
    applyGlobalTextScaling();

    const { getByText } = render(
      <RNText maxFontSizeMultiplier={1}>fixed</RNText>
    );

    expect(getByText('fixed').props.maxFontSizeMultiplier).toBe(1);
  });
});

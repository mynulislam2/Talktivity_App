import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppBackground } from '../AppBackground';
import { tokens } from '../../../theme/tokens';

describe('AppBackground', () => {
  it('renders its children', () => {
    const { getByText } = render(
      <AppBackground><Text>hello</Text></AppBackground>
    );
    expect(getByText('hello')).toBeTruthy();
  });

  it('paints the app background colour, never transparent', () => {
    const { getByTestId } = render(
      <AppBackground><Text>x</Text></AppBackground>
    );
    const style = getByTestId('app-background').props.style;
    const flat = Array.isArray(style) ? Object.assign({}, ...style) : style;
    expect(flat.backgroundColor).toBe(tokens.color.bg.screen);
    expect(flat.backgroundColor).not.toBe('transparent');
  });

  it('renders the blurred gradient image over the base colour', () => {
    const { getByTestId } = render(
      <AppBackground><Text>x</Text></AppBackground>
    );
    expect(getByTestId('app-background-gradient')).toBeTruthy();
  });
});

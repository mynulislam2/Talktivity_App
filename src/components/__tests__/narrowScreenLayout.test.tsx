import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, useWindowDimensions } from 'react-native';

import { ProfileActivityCard } from '../profile/ProfileActivityCard';
import { HomeViewToggle } from '../home/HomeViewToggle';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('@expo/vector-icons/Feather', () => 'Feather');

const mockedDimensions = useWindowDimensions as unknown as jest.Mock;
const setScreen = (width: number) =>
  mockedDimensions.mockReturnValue({ width, height: 640, scale: 2, fontScale: 1 });

const flat = (style: unknown) => Object.assign({}, ...[].concat(style as never).filter(Boolean));

const hasText = (node: { props: { children?: unknown } }, content: string) =>
  ([] as unknown[])
    .concat(node.props.children ?? [])
    .some((child) => typeof child === 'string' && child.trim() === content);

const styleOfText = (tree: ReturnType<typeof render>, content: string) =>
  flat(tree.UNSAFE_getAllByType(Text).find((node) => hasText(node, content))?.props.style);

const PROGRESS_STATS = {
  courseProgress: { progress: { total_practice_time: 0, complete_days: 0 } },
} as never;

/**
 * Regression cover for the small-screen APK report. Each assertion below
 * corresponds to a specific fixed dimension that used to be wider than the
 * space a 360pt phone actually leaves, which forced RN to break a label
 * inside a word ("Lear / ning / Time", "Today's / Plan").
 *
 * The measured proof lives in docs/design/harness-audit.js, which lays these
 * components out for real at 300-412pt; this suite is the cheap guard that
 * fails in CI if the caps come back.
 */
describe('narrow-screen layout', () => {
  afterEach(() => jest.clearAllMocks());

  describe('ProfileActivityCard stat labels', () => {
    it('lets the label take the width the icon leaves, at any screen size', () => {
      setScreen(360);

      const tree = render(<ProfileActivityCard progressStats={PROGRESS_STATS} />);
      const label = styleOfText(tree, 'Learning Time');

      // The former `maxWidth: 88` was wider than the ~64pt actually available
      // here, so the cap did nothing except stop flexbox from helping.
      expect(label.maxWidth).toBeUndefined();
      expect(label.flex).toBe(1);
      expect(label.minWidth).toBe(0);
    });

    it('shrinks the decorative icon on a narrow screen but not on a roomy one', () => {
      setScreen(360);
      const narrowIcon = render(<ProfileActivityCard progressStats={PROGRESS_STATS} />)
        .UNSAFE_getAllByType('Ionicons' as never)[0];

      setScreen(412);
      const wideIcon = render(<ProfileActivityCard progressStats={PROGRESS_STATS} />)
        .UNSAFE_getAllByType('Ionicons' as never)[0];

      expect(narrowIcon.props.size).toBeLessThan(wideIcon.props.size);
      expect(wideIcon.props.size).toBe(44);
    });
  });

  describe('HomeViewToggle tabs', () => {
    it('keeps each tab label on one line', () => {
      setScreen(360);

      const tree = render(<HomeViewToggle viewMode="today" onViewModeChange={() => {}} />);

      for (const label of ["Today's Plan", 'Full Timeline']) {
        const node = tree.UNSAFE_getAllByType(Text).find((candidate) => hasText(candidate, label));
        expect(node?.props.numberOfLines).toBe(1);
      }
    });
  });
});

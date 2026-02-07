/**
 * Typography
 * 
 * Font styles and text variants
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text.primary,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    color: colors.text.primary,
  },
  h3: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.text.primary,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text.primary,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.text.primary,
  },

  // Body text
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text.primary,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.secondary,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.text.tertiary,
  },

  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    color: colors.text.primary,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text.secondary,
  },

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text.tertiary,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text.tertiary,
  },
});

export default typography;

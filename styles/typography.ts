/**
 * Typography
 * 
 * Font styles and text variants
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const typography = StyleSheet.create({
  // Headings - Optimized for mobile
  h1: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.text.primary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    color: colors.text.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: colors.text.primary,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.text.primary,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text.primary,
  },

  // Body text
  body1: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.primary,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
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
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
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

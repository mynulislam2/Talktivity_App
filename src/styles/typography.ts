import { Platform, StyleSheet } from 'react-native';
import { colors } from './colors';

const fontFamily = {
  sans: Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'System',
  }),
  urbanist: Platform.select({
    ios: 'Urbanist-Variable',
    android: 'Urbanist-Variable',
    default: 'System',
  }),
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    color: colors.text.primary,
    fontFamily: fontFamily.urbanist,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    color: colors.text.primary,
    fontFamily: fontFamily.urbanist,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    color: colors.text.primary,
    fontFamily: fontFamily.urbanist,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    color: colors.text.primary,
    fontFamily: fontFamily.urbanist,
  },
  h5: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text.primary,
    fontFamily: fontFamily.urbanist,
  },

  body1: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.primary,
    fontFamily: fontFamily.sans,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.text.secondary,
    fontFamily: fontFamily.sans,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    color: colors.text.tertiary,
    fontFamily: fontFamily.sans,
  },

  label: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text.primary,
    fontFamily: fontFamily.sans,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text.secondary,
    fontFamily: fontFamily.sans,
  },

  button: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    fontFamily: fontFamily.sans,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text.tertiary,
    fontFamily: fontFamily.sans,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    color: colors.text.tertiary,
    fontFamily: fontFamily.sans,
  },
});

export { fontFamily };
export default typography;

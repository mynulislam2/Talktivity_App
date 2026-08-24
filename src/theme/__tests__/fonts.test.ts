import { fontFamilyForWeight, typeScale } from '../fonts';

describe('fontFamilyForWeight', () => {
  it('maps every weight the app uses to a loaded Poppins family', () => {
    expect(fontFamilyForWeight('300')).toBe('Poppins-Light');
    expect(fontFamilyForWeight('400')).toBe('Poppins');
    expect(fontFamilyForWeight('500')).toBe('Poppins-Medium');
    expect(fontFamilyForWeight('600')).toBe('Poppins-SemiBold');
    expect(fontFamilyForWeight('700')).toBe('Poppins-Bold');
    expect(fontFamilyForWeight('bold')).toBe('Poppins-Bold');
  });

  it('clamps 800/900 up to Poppins-Bold — the heaviest face actually loaded', () => {
    expect(fontFamilyForWeight('800')).toBe('Poppins-Bold');
    expect(fontFamilyForWeight('900')).toBe('Poppins-Bold');
  });

  it('falls back to regular Poppins for an unmapped weight', () => {
    expect(fontFamilyForWeight(undefined)).toBe('Poppins');
    expect(fontFamilyForWeight('100')).toBe('Poppins');
  });
});

describe('type presets', () => {
  it('matches the web body role: 14px / 400 / 1.4', () => {
    expect(typeScale.body.fontSize).toBe(14);
    expect(typeScale.body.lineHeight).toBeCloseTo(19.6, 1);
    expect(typeScale.body.fontFamily).toBe('Poppins');
  });

  it('matches the web title role: 28px / 500 / 1.2', () => {
    expect(typeScale.title.fontSize).toBe(28);
    expect(typeScale.title.lineHeight).toBeCloseTo(33.6, 1);
    expect(typeScale.title.fontFamily).toBe('Poppins-Medium');
  });
});

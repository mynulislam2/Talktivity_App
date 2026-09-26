import { deriveCefr, formatBandLabel } from '../bandLabel';

describe('deriveCefr — IELTS-to-CEFR alignment', () => {
  it('returns null for a missing or non-finite band', () => {
    expect(deriveCefr(null)).toEqual({ level: null, approximate: false });
    expect(deriveCefr(undefined)).toEqual({ level: null, approximate: false });
    expect(deriveCefr(NaN)).toEqual({ level: null, approximate: false });
  });

  it('returns null for a band of exactly 0 (no official alignment)', () => {
    expect(deriveCefr(0)).toEqual({ level: null, approximate: false });
  });

  it.each([
    [9.0, 'C2'],
    [8.5, 'C2'],
    [8.0, 'C1'],
    [7.0, 'C1'],
    [6.5, 'B2'],
    [5.5, 'B2'],
    [5.0, 'B1'],
    [4.0, 'B1'],
  ])('band %s maps to official CEFR %s (not approximate)', (band, level) => {
    expect(deriveCefr(band)).toEqual({ level, approximate: false });
  });

  it.each([
    [3.9, 'A2'],
    [3.0, 'A2'],
    [2.9, 'A1'],
    [0.5, 'A1'],
  ])('band %s maps to approximate CEFR %s (below official alignment)', (band, level) => {
    expect(deriveCefr(band)).toEqual({ level, approximate: true });
  });
});

describe('formatBandLabel — the "Band X.X (CEFR)" label used everywhere', () => {
  it('formats an official-alignment band as "Band 5.5 (B2)"', () => {
    expect(formatBandLabel(5.5)).toBe('Band 5.5 (B2)');
  });

  it('formats a below-alignment band as "Band 3.5 (A2, approx.)"', () => {
    expect(formatBandLabel(3.5)).toBe('Band 3.5 (A2, approx.)');
  });

  it('formats a band of 0 with no CEFR suffix at all', () => {
    expect(formatBandLabel(0)).toBe('Band 0.0');
  });

  it('trusts a server-supplied cefr over the local derivation', () => {
    expect(formatBandLabel(6.5, 'C1')).toBe('Band 6.5 (C1)');
  });

  it('never renders "Band null" or "Band NaN" — returns null instead', () => {
    expect(formatBandLabel(null)).toBeNull();
    expect(formatBandLabel(undefined)).toBeNull();
    expect(formatBandLabel(NaN)).toBeNull();
  });

  it('rounds the displayed number to one decimal place', () => {
    expect(formatBandLabel(9)).toBe('Band 9.0 (C2)');
  });
});

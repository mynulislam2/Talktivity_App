import {
  BASE_WIDTH,
  MAX_FONT_SCALE,
  NARROW_WIDTH,
  fontSize,
  isNarrow,
  moderateScale,
  scale,
  widthFactor,
} from '../responsive';

/** Real device widths in points, smallest first. */
const SMALL_ANDROID = 320; // e.g. Galaxy J2 / very old budget phones
const COMMON_ANDROID = 360; // the size the APK bug report came from
const DESIGN = BASE_WIDTH; // 393 — what every screen was laid out against
const PIXEL_9 = 412; // where the layouts already looked right

describe('widthFactor', () => {
  it('leaves the design width untouched', () => {
    expect(widthFactor(DESIGN)).toBe(1);
  });

  it('does not enlarge anything on a wider phone', () => {
    // A Pixel 9 is 5% wider than the design frame. Scaling up would make the
    // app read as zoomed rather than roomy — and it is the size the design
    // was signed off at.
    expect(widthFactor(PIXEL_9)).toBe(1);
  });

  it('shrinks on a narrower phone', () => {
    expect(widthFactor(COMMON_ANDROID)).toBeCloseTo(360 / 393, 5);
    expect(widthFactor(COMMON_ANDROID)).toBeLessThan(1);
  });

  it('never shrinks past the floor, however small the screen', () => {
    // 320/393 = 0.814, below the 0.82 floor. Anything smaller clamps to the
    // same value: past this point icons stop being legible and tap targets
    // stop meeting the 44pt guidance, so a layout that still overflows has a
    // constraint bug that scaling must not paper over.
    expect(widthFactor(SMALL_ANDROID)).toBe(0.82);
    expect(widthFactor(240)).toBe(0.82);
    expect(widthFactor(1)).toBe(0.82);
  });
});

describe('scale', () => {
  it('returns the original size at the design width', () => {
    expect(scale(46, DESIGN)).toBe(46);
  });

  it('shrinks a fixed dimension on a narrow phone', () => {
    const shrunk = scale(46, COMMON_ANDROID);
    expect(shrunk).toBeLessThan(46);
    expect(shrunk).toBeGreaterThan(46 * 0.8);
  });
});

describe('moderateScale', () => {
  it('shrinks less than a raw scale, so padding does not collapse', () => {
    const raw = scale(24, COMMON_ANDROID);
    const moderate = moderateScale(24, 0.5, COMMON_ANDROID);
    expect(moderate).toBeGreaterThan(raw);
    expect(moderate).toBeLessThan(24);
  });

  it('is a no-op at the design width', () => {
    expect(moderateScale(24, 0.5, DESIGN)).toBe(24);
  });
});

describe('fontSize', () => {
  it('returns whole points — fractional sizes render inconsistently on Android', () => {
    for (const width of [SMALL_ANDROID, COMMON_ANDROID, DESIGN, PIXEL_9]) {
      expect(Number.isInteger(fontSize(16, width))).toBe(true);
    }
  });

  it('keeps a title recognisably the same size on a narrow phone', () => {
    // 24pt dropping to 20pt would read as a different design; the helper is
    // deliberately gentler than `scale`.
    const narrowTitle = fontSize(24, COMMON_ANDROID);
    expect(narrowTitle).toBeLessThan(24);
    expect(narrowTitle).toBeGreaterThanOrEqual(22);
  });

  it('does not change at or above the design width', () => {
    expect(fontSize(16, DESIGN)).toBe(16);
    expect(fontSize(16, PIXEL_9)).toBe(16);
  });
});

describe('isNarrow', () => {
  it('flags the phone sizes the compact treatment exists for', () => {
    expect(isNarrow(SMALL_ANDROID)).toBe(true);
    expect(isNarrow(COMMON_ANDROID)).toBe(true);
    expect(isNarrow(NARROW_WIDTH)).toBe(true);
  });

  it('leaves the design width and larger on the roomy treatment', () => {
    expect(isNarrow(DESIGN)).toBe(false);
    expect(isNarrow(PIXEL_9)).toBe(false);
  });
});

describe('MAX_FONT_SCALE', () => {
  it('still enlarges text for users who ask for it', () => {
    expect(MAX_FONT_SCALE).toBeGreaterThan(1);
  });

  it('stays below the multiplier at which rows can no longer be laid out', () => {
    // Android offers up to 2.0x. Every row here fits a 360pt phone with
    // little to spare, so above ~1.2x RN's only option is to break inside a
    // word — the exact symptom reported from the APK build.
    expect(MAX_FONT_SCALE).toBeLessThanOrEqual(1.2);
  });
});

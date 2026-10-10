import { formatAudioTime } from '@/components/ielts/IeltsAudioPlayer';

describe('formatAudioTime', () => {
  it('formats zero and negative values to 00:00', () => {
    expect(formatAudioTime(0)).toBe('00:00');
    expect(formatAudioTime(-500)).toBe('00:00');
  });

  it('handles invalid numbers safely', () => {
    expect(formatAudioTime(NaN)).toBe('00:00');
    expect(formatAudioTime(Infinity)).toBe('00:00');
  });

  it('formats sub-minute times accurately', () => {
    expect(formatAudioTime(5000)).toBe('00:05');
    expect(formatAudioTime(45000)).toBe('00:45');
    expect(formatAudioTime(59000)).toBe('00:59');
  });

  it('formats multi-minute times accurately', () => {
    expect(formatAudioTime(60000)).toBe('01:00');
    expect(formatAudioTime(125000)).toBe('02:05');
    expect(formatAudioTime(630000)).toBe('10:30');
    expect(formatAudioTime(3599000)).toBe('59:59');
  });
});

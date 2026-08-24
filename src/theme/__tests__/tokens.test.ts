import { tokens } from '../tokens';

describe('design tokens', () => {
  it('uses the web screen background', () => {
    expect(tokens.color.bg.screen).toBe('#09090f');
  });

  it('uses the web card surface and border', () => {
    expect(tokens.color.surface.card).toBe('rgba(255,255,255,0.10)');
    expect(tokens.color.border.card).toBe('#3d3e50');
  });

  it('uses the web text colours', () => {
    expect(tokens.color.text.primary).toBe('#fdfdfd');
    expect(tokens.color.text.secondary).toBe('#c6c6c6');
    expect(tokens.color.text.placeholder).toBe('#8c8c8c');
  });

  it('has exactly one accent blue', () => {
    expect(tokens.color.accent.primary).toBe('#2949ff');
  });

  it('defaults radius to 6 and control height to 42', () => {
    expect(tokens.radius.sm).toBe(6);
    expect(tokens.control.height).toBe(42);
  });
});

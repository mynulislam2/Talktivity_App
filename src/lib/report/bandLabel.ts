/**
 * Band label formatting
 *
 * One source of truth for turning an IELTS band number into the label the
 * whole app shows: "Band 5.5 (B2)", or "Band 3.5 (A2, approx.)" below the
 * official IELTS-to-CEFR alignment. The band itself always comes from the
 * backend (or, for a report saved before bands existed, is absent); this
 * module only formats it — it never invents one.
 *
 * Same alignment table as the backend's `bandToCefr`
 * (talktivity_node_server/src/core/scoring/bands.js):
 * >=8.5 C2, >=7.0 C1, >=5.5 B2, >=4.0 B1, >=3.0 A2 (approx), >0 A1 (approx).
 */

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface CefrResult {
  level: CefrLevel | null;
  approximate: boolean;
}

export function deriveCefr(band: number | null | undefined): CefrResult {
  if (band == null || !Number.isFinite(band) || band <= 0) {
    return { level: null, approximate: false };
  }
  if (band >= 8.5) return { level: 'C2', approximate: false };
  if (band >= 7.0) return { level: 'C1', approximate: false };
  if (band >= 5.5) return { level: 'B2', approximate: false };
  if (band >= 4.0) return { level: 'B1', approximate: false };
  if (band >= 3.0) return { level: 'A2', approximate: true };
  return { level: 'A1', approximate: true };
}

/**
 * "Band 5.5 (B2)" / "Band 3.5 (A2, approx.)" / "Band 0.0" (no CEFR alignment)
 * / null when there is no band to show. `cefr` lets a server-computed label
 * win over the local derivation; old stored reports have no cefr field and
 * fall back to `deriveCefr` here. `approximate` is always derived from the
 * band itself — it is a deterministic property of the band value, not
 * something the caller decides.
 */
export function formatBandLabel(
  band: number | null | undefined,
  cefr?: string | null
): string | null {
  if (band == null || !Number.isFinite(band)) return null;
  const bandText = band.toFixed(1);
  const derived = deriveCefr(band);
  const level = cefr ?? derived.level;
  if (!level) return `Band ${bandText}`;
  return derived.approximate ? `Band ${bandText} (${level}, approx.)` : `Band ${bandText} (${level})`;
}

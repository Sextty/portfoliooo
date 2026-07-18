/**
 * "Harbor" design system tokens — the commercial rebrand.
 *
 * A light, product-company system: porcelain ground, paper surfaces,
 * deep ink text, and one confident cobalt accent (the blue of Sidi Bou
 * Said doors). Each project supplies its own color inside its frame.
 *
 * NOTE: legacy key names (ground/field/print/trace/redline…) are kept as
 * semantic aliases because older pages (AdminPanel) read them directly:
 *   ground  = page background      field   = raised surface (paper)
 *   print   = primary text (ink)   trace   = secondary text (slate)
 *   redline = brand accent (cobalt)
 */
export const COLORS = {
  /** Page ground — porcelain */
  ground: "#F6F7F9",
  /** Raised surfaces — paper */
  field: "#FFFFFF",
  /** Primary text — ink */
  print: "#0F1222",
  /** Secondary text — slate */
  trace: "#566070",
  /** Hairline border */
  line: "#E6E8F0",
  /** Fainter internal divider */
  lineFaint: "#EFF1F6",
  /** Ultra-faint texture line */
  gridLine: "#F0F2F7",
  /** Brand accent — cobalt */
  redline: "#2B50E0",
  /** Accent hover — deep cobalt */
  redlineBright: "#1E3CB8",
  /** Translucent accent fill */
  redlineSoft: "rgba(43,80,224,0.08)",

  /* ── New-system names (preferred going forward) ── */
  /** Page ground */
  porcelain: "#F6F7F9",
  /** Card / surface */
  paper: "#FFFFFF",
  /** Headlines, body text, dark band ground */
  ink: "#0F1222",
  /** Elevated surface on dark bands */
  inkSoft: "#181C34",
  /** Secondary text */
  slate: "#566070",
  /** Brand accent */
  cobalt: "#2B50E0",
  /** Brand accent, hover */
  cobaltDeep: "#1E3CB8",
  /** Translucent brand fill */
  cobaltSoft: "rgba(43,80,224,0.08)",
  /** Availability / success signal */
  mint: "#0E9F6E",
  /** Text on dark bands */
  darkText: "#F3F5FA",
  /** Muted text on dark bands */
  darkMuted: "#9AA2B8",
  /** Hairline on dark bands */
  darkLine: "rgba(255,255,255,0.10)",
} as const;

export const FONTS = {
  /** Bricolage Grotesque — display headlines (tight leading, -2% tracking) */
  display: "'Bricolage Grotesque', sans-serif",
  /** Instrument Sans — body copy and UI */
  body: "'Instrument Sans', sans-serif",
  /** JetBrains Mono — labels, stack chips, code */
  mono: "'JetBrains Mono', monospace",
} as const;

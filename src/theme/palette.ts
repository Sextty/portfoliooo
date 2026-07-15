/**
 * Blueprint design system tokens.
 * The portfolio is styled as an engineering drawing: a deep drafting-blue
 * sheet, faded print linework, and a single "redline" markup accent.
 */
export const COLORS = {
  /** Drafting Blue — page ground (the blueprint sheet) */
  ground: "#0B1E36",
  /** Deep Field — recessed panels, code areas, modal scrims */
  field: "#071527",
  /** Print White — primary text and linework */
  print: "#E6EEF7",
  /** Trace Blue — annotations, dimension lines, muted text */
  trace: "#7FA3C9",
  /** Standard hairline border */
  line: "rgba(127,163,201,0.28)",
  /** Fainter hairline for internal dividers */
  lineFaint: "rgba(127,163,201,0.16)",
  /** Sheet grid texture */
  gridLine: "rgba(127,163,201,0.10)",
  /** Redline — THE accent (markup on engineering drawings) */
  redline: "#FF5C39",
  /** Lighter redline for hover states */
  redlineBright: "#FF7A5C",
  /** Translucent redline fill */
  redlineSoft: "rgba(255,92,57,0.12)",
} as const;

export const FONTS = {
  /** Archivo — display plate lettering (pair with fontStretch 125%, uppercase) */
  display: "'Archivo', sans-serif",
  /** IBM Plex Sans — body copy */
  body: "'IBM Plex Sans', sans-serif",
  /** IBM Plex Mono — annotations, labels, figure numbers */
  mono: "'IBM Plex Mono', monospace",
} as const;

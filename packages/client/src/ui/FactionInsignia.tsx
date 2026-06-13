// SVG faction insignias. All symbols centered at (0,0) in a 24×24 viewBox.

interface Props {
  faction: string;
  size?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

export default function FactionInsignia({ faction, size = 20, color = 'currentColor', opacity = 1, style }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      opacity={opacity}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-label={`${faction} insignia`}
    >
      {PATHS[faction] ?? PATHS.NONE}
    </svg>
  );
}

// ── Imperial cog ────────────────────────────────────────────────────────────────
// 8-segment wheel: outer ring, 8 triangular notches, inner disc
const IMPERIAL = (
  <>
    {/* Outer ring */}
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.2" />
    {/* 8 spokes — triangular wedges pointing inward */}
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const a1 = a - 0.22;
      const a2 = a + 0.22;
      const r1 = 9.2, r2 = 5.5;
      const x1 = 12 + Math.cos(a1) * r1, y1 = 12 + Math.sin(a1) * r1;
      const x2 = 12 + Math.cos(a2) * r1, y2 = 12 + Math.sin(a2) * r1;
      const x3 = 12 + Math.cos(a)  * r2, y3 = 12 + Math.sin(a)  * r2;
      return <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} />;
    })}
    {/* Centre disc */}
    <circle cx="12" cy="12" r="3.5" />
  </>
);

// ── Rebel starbird / Alliance phoenix ───────────────────────────────────────────
// Stylised bird shape: swept wings up, tail down, head forward
const REBEL = (
  <path d={[
    // Left wing — sweeping arc up-left
    'M 12 10', 'C 10 8, 5 6, 2 5',   // inner arc to wing tip
    'L 4 9',                           // lower wing edge
    'C 7 9.5, 10 10.5, 12 12',        // back to centre
    // Right wing — mirror
    'C 14 10.5, 17 9.5, 20 9',
    'L 22 5',
    'C 19 6, 14 8, 12 10',
    'Z',
    // Body / head
    'M 12 12', 'L 11 15', 'L 12 22', 'L 13 15', 'Z',
    // Head nub
    'M 12 10', 'L 11 7', 'L 12 5', 'L 13 7', 'Z',
  ].join(' ')} fillRule="evenodd" />
);

// ── Hutt clan crest ──────────────────────────────────────────────────────────────
// Ornate oval with outer ring and three inner dot-marks (Hutt territorial brand)
const HUTT = (
  <>
    <ellipse cx="12" cy="12" rx="9" ry="7" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <ellipse cx="12" cy="12" rx="6.5" ry="5" fill="none" stroke="currentColor" strokeWidth="0.7" />
    {/* Three pips */}
    <circle cx="9"  cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="15" cy="12" r="1.2" />
    {/* Top/bottom notches */}
    <rect x="11" y="3.5" width="2" height="1.5" rx="0.3" />
    <rect x="11" y="19"  width="2" height="1.5" rx="0.3" />
  </>
);

// ── Syndicate mark ───────────────────────────────────────────────────────────────
// Crimson Dawn / criminal syndicate: a faceted gem / crossed daggers silhouette
const SYNDICATE = (
  <path d={[
    // Outer diamond
    'M 12 2 L 20 9 L 19 15 L 12 22 L 5 15 L 4 9 Z',
    // Inner cut lines to give faceted look
    'M 12 2 L 12 22',
    'M 4 9  L 20 9',
    'M 5 15 L 19 15',
  ].join(' ')} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
);

const NONE = (
  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
);

const PATHS: Record<string, React.ReactNode> = {
  IMPERIAL:  IMPERIAL,
  REBEL:     REBEL,
  HUTT:      HUTT,
  SYNDICATE: SYNDICATE,
  NONE:      NONE,
};

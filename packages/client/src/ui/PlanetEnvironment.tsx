import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { MAP_NODES } from '@outer-rim/shared';
import gsap from 'gsap';

// Mirrors the glow + primary colours from PlanetNode.tsx; uses canon Star Wars lore labels
const PLANET_ENV: Record<string, { glow: string; accent: string; label: string }> = {
  tatooine:    { glow: '#f5a020', accent: '#c8823a', label: 'OUTER RIM — TWIN SUNS DESERT' },
  rodia:       { glow: '#3cc87a', accent: '#1a5c28', label: 'OUTER RIM — RODIAN HOMEWORLD' },
  ryloth:      { glow: '#d4900a', accent: '#8a6428', label: 'OUTER RIM — TWIL\'EK HOMEWORLD' },
  mon_cala:    { glow: '#4da6ff', accent: '#1055a0', label: 'OUTER RIM — MON CALAMARI OCEAN WORLD' },
  geonosis:    { glow: '#e05555', accent: '#6a2208', label: 'OUTER RIM — BIRTHPLACE OF THE CLONE WARS' },
  corellia:    { glow: '#4da6ff', accent: '#1a6030', label: 'CORE WORLD — HAN SOLO\'S HOMEWORLD' },
  ord_mantell: { glow: '#8099b8', accent: '#4a4e5a', label: 'MID RIM — JUNKYARD WORLD, CRIMINAL HAVEN' },
  nal_hutta:   { glow: '#3cc87a', accent: '#4a7010', label: 'OUTER RIM — SEAT OF THE HUTT GRAND COUNCIL' },
  kessel:      { glow: '#8099b8', accent: '#1a1820', label: 'OUTER RIM — SPICE MINES, IMPERIAL PRISON' },
  maelstrom:   { glow: '#e05555', accent: '#2a0a40', label: 'DEEP SPACE — UNSTABLE ASTEROID FIELD' },
};

export default function PlanetEnvironment() {
  const mySessionId = useGameStore(s => s.mySessionId);
  const players     = useGameStore(s => s.players);
  const phase       = useGameStore(s => s.phase);
  const wrapRef     = useRef<HTMLDivElement>(null);
  const prevPlanetRef = useRef<string | null>(null);

  const myPlayer = players.get(mySessionId);
  const node = myPlayer ? MAP_NODES.find(n => n.id === myPlayer.currentNodeId) : null;
  const planetId = node?.type === 'PLANET' || node?.type === 'MAELSTROM' ? node.planetId ?? null : null;
  const env = planetId ? PLANET_ENV[planetId] : null;

  const active = phase !== 'WAITING_FOR_PLAYERS' && phase !== 'GAME_OVER' && env != null;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (active && planetId !== prevPlanetRef.current) {
      prevPlanetRef.current = planetId;
      gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    } else if (!active) {
      prevPlanetRef.current = null;
      gsap.to(wrap, { opacity: 0, duration: 0.6, ease: 'power2.in' });
    }
  }, [active, planetId]);

  if (!env) return (
    <div ref={wrapRef} style={{ ...S.root, opacity: 0, pointerEvents: 'none' }} />
  );

  return (
    <div ref={wrapRef} style={{ ...S.root, opacity: 0 }}>
      {/* Corner atmosphere glows */}
      <div style={{ ...S.corner, ...S.tl, background: `radial-gradient(ellipse at top left, ${env.glow}18 0%, transparent 65%)` }} />
      <div style={{ ...S.corner, ...S.br, background: `radial-gradient(ellipse at bottom right, ${env.glow}14 0%, transparent 65%)` }} />

      {/* Top-edge atmosphere line */}
      <div style={{ ...S.edge, background: `linear-gradient(to bottom, ${env.glow}1a 0%, transparent 100%)`, height: 120, top: 0 }} />

      {/* Bottom-edge atmosphere line */}
      <div style={{ ...S.edge, background: `linear-gradient(to top, ${env.accent}14 0%, transparent 100%)`, height: 80, bottom: 0 }} />

      {/* Planet label — bottom-left, above Terminal */}
      <div style={S.label}>
        <div style={S.labelName}>{node?.name?.toUpperCase()}</div>
        <div style={{ ...S.labelType, color: env.glow }}>{env.label}</div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  root: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    pointerEvents: 'none',
  },
  corner: {
    position: 'absolute',
    width: '45vw',
    height: '45vh',
  },
  tl: { top: 0, left: 0 },
  br: { bottom: 0, right: 0 },
  edge: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  label: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    fontFamily: "'Share Tech Mono', monospace",
    lineHeight: 1.4,
  },
  labelName: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.55rem',
    color: 'var(--ck-dim)',
    letterSpacing: '.18em',
  },
  labelType: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.5rem',
    letterSpacing: '.14em',
    opacity: .75,
  },
};

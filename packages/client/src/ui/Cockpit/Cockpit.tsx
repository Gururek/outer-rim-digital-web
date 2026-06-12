import { MAP_NODES } from '@outer-rim/shared';
import { getCharacter, getShip } from '@outer-rim/shared';
import { useGameStore } from '../../stores/gameStore';
import type { FactionType, GamePhase } from '@outer-rim/shared';
import { useState } from 'react';
import SettingsPanel from '../SettingsPanel';

// ─── Cockpit overlay: header bar + galaxy minimap + systems panel ─────────────

export default function CockpitOverlay() {
  const phase       = useGameStore(s => s.phase);
  const turnNumber  = useGameStore(s => s.turnNumber);
  const fameReq     = useGameStore(s => s.fameRequirement);
  const activeId    = useGameStore(s => s.activePlayerId);
  const myId        = useGameStore(s => s.mySessionId);
  const players     = useGameStore(s => s.players);
  const patrolNodes = useGameStore(s => s.patrolNodes);
  const [showSettings, setShowSettings] = useState(false);

  const me = players.get(myId);
  if (!me) return null;

  const char = getCharacter(me.characterId);
  const ship = getShip(me.shipId);
  const maxHealth = char?.maxHealth ?? 8;
  const maxHull   = ship?.maxHull   ?? 6;
  const isMyTurn  = activeId === myId;
  const activePlayer = players.get(activeId);

  return (
    <div style={S.root}>
      {/* Scanline texture */}
      <div className="ck-scan" />

      {/* ── Header bar ─────────────────────────────────────────────────── */}
      <div style={S.header}>
        {/* Left: vessel + pilot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div className="ck-label">VESSEL</div>
            <div style={S.headerVal}>{ship?.name ?? '—'}</div>
          </div>
          <div style={S.headerDiv} />
          <div>
            <div className="ck-label">PILOT</div>
            <div style={S.headerVal}>{char?.name ?? '—'}</div>
          </div>
        </div>

        {/* Center: phase badge */}
        <div style={S.badgeWrap}>
          <div
            style={{
              ...S.badge,
              borderColor: phaseColor(phase),
              color:       phaseColor(phase),
              background:  `${phaseColor(phase)}18`,
            }}
            className={isMyTurn && phase === 'PLANNING' ? 'ck-anim-blink' : undefined}
          >
            {phaseLabel(phase, isMyTurn, activePlayer?.displayName)}
          </div>
        </div>

        {/* Right: credits + fame */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="ck-label">CREDITS</div>
            <div style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: 'var(--ck-gold)', letterSpacing: '.04em', marginTop: 1 }}>
              {me.credits.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="ck-label" style={{ marginBottom: 3 }}>FAME &nbsp;{me.fame} / {fameReq}</div>
            <div style={S.fameBarBg}>
              <div style={{ ...S.fameBarFill, width: `${Math.min(100, (me.fame / fameReq) * 100)}%` }} />
            </div>
          </div>
          <SettingsButton onClick={() => setShowSettings(true)} />
        </div>
      </div>

      {/* ── Bottom-left: Galaxy minimap ────────────────────────────────── */}
      <div style={S.minimapPanel}>
        <div style={S.panelHeader}>
          <span className="ck-label">GALAXY MAP</span>
          <span style={{ fontSize: 8, color: 'var(--ck-gold)', fontFamily: "'Orbitron',sans-serif" }} className="ck-anim-blink">▪ LIVE</span>
        </div>
        <div style={{ flex: 1, padding: 4 }}>
          <GalaxyMinimap
            currentNodeId={me.currentNodeId}
            playerNodes={Array.from(players.values()).map(p => ({ nodeId: p.currentNodeId, isMe: p === me }))}
            patrolNodes={patrolNodes}
          />
        </div>
        <div style={S.minimapFooter}>
          <div className="ck-label">CURRENT POSITION</div>
          <div style={{ fontSize: 10, color: 'var(--ck-accent)', marginTop: 2 }}>
            {MAP_NODES.find(n => n.id === me.currentNodeId)?.name ?? '—'}
          </div>
        </div>
      </div>

      {/* ── Bottom-right: Systems panel ────────────────────────────────── */}
      <div style={S.systemsPanel}>
        <div style={S.panelHeader}>
          <span className="ck-label">SYSTEMS</span>
          <span style={{ fontSize: 8, color: 'var(--ck-dim)', fontFamily: "'Orbitron',sans-serif" }}>T-{turnNumber}</span>
        </div>

        {/* Faction standing */}
        <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }}>
          <div className="ck-label" style={{ marginBottom: 6 }}>FACTION STANDING</div>
          <RepBar faction="HUTT"      value={me.rep.HUTT}      color="var(--faction-hutt)" />
          <RepBar faction="SYNDICATE" value={me.rep.SYNDICATE} color="var(--faction-syndicate)" />
          <RepBar faction="IMPERIAL"  value={me.rep.IMPERIAL}  color="var(--faction-imperial)" />
          <RepBar faction="REBEL"     value={me.rep.REBEL}     color="var(--faction-rebel)" />
        </div>

        {/* Ship status */}
        <div style={S.shipStatus}>
          <div className="ck-label" style={{ marginBottom: 6 }}>SHIP STATUS</div>
          <div style={S.statRow}>
            <span className="ck-label" style={{ letterSpacing: '.06em' }}>HYPERDRIVE</span>
            <span style={S.statNum}>{ship?.hyperdrive ?? '—'}</span>
          </div>
          <div style={S.statRow}>
            <span className="ck-label" style={{ letterSpacing: '.06em' }}>COMBAT</span>
            <span style={{ ...S.statNum, color: 'var(--ck-gold)' }}>{ship?.shipCombatValue ?? '—'}</span>
          </div>
          <div className="ck-label" style={{ marginBottom: 3 }}>HULL</div>
          <SegmentTrack current={maxHull - me.shipDamage} max={maxHull} color="var(--ck-gold)" />
          <div className="ck-label" style={{ marginTop: 5, marginBottom: 3 }}>HEALTH</div>
          <SegmentTrack current={maxHealth - me.characterDamage} max={maxHealth} color="var(--ck-green)" />
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

// ─── Galaxy minimap SVG ───────────────────────────────────────────────────────

const FACTION_COLORS: Record<string, string> = {
  HUTT:      'var(--faction-hutt)',
  SYNDICATE: 'var(--faction-syndicate)',
  IMPERIAL:  'var(--faction-imperial)',
  REBEL:     'var(--faction-rebel)',
  NONE:      '#2a5a80',
};

function nodeToSvg(x: number, z: number): [number, number] {
  const svgX = ((x + 12) / 24) * 150 + 5;
  const svgY = ((z + 12) / 16) * 108 + 6;  // Z range: -12 (arch apex) → +4 (opening)
  return [svgX, svgY];
}

interface MinimapProps {
  currentNodeId: number;
  playerNodes: { nodeId: number; isMe: boolean }[];
  patrolNodes: Record<FactionType, number>;
}

function GalaxyMinimap({ currentNodeId, playerNodes }: MinimapProps) {
  const drawnEdges = new Set<string>();

  return (
    <svg viewBox="0 0 160 120" style={{ width: '100%', height: '100%' }}>
      {/* Hyperspace lanes */}
      {MAP_NODES.map(node => {
        const [x1, y1] = nodeToSvg(node.position[0], node.position[2]);
        return node.connectedNodeIds.map(neighborId => {
          const key = [Math.min(node.id, neighborId), Math.max(node.id, neighborId)].join('-');
          if (drawnEdges.has(key)) return null;
          drawnEdges.add(key);
          const neighbor = MAP_NODES.find(n => n.id === neighborId);
          if (!neighbor) return null;
          const [x2, y2] = nodeToSvg(neighbor.position[0], neighbor.position[2]);
          return (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#1a4870" strokeWidth=".8" />
          );
        });
      })}

      {/* Nodes */}
      {MAP_NODES.map(node => {
        const [cx, cy] = nodeToSvg(node.position[0], node.position[2]);
        const isCurrent = node.id === currentNodeId;
        const isNavPoint = node.type === 'NAVPOINT';
        const isMaelstrom = node.type === 'MAELSTROM';
        const color = isMaelstrom ? '#6633aa' : isNavPoint ? '#2a5a80' : FACTION_COLORS[node.factionOwner] ?? '#2a5a80';
        const r = isCurrent ? 4 : isNavPoint ? 1.5 : 2.5;

        return (
          <g key={node.id}>
            {isCurrent && (
              <circle cx={cx} cy={cy} r={8} fill="none" stroke="var(--ck-accent)"
                strokeWidth=".8" opacity=".5" className="ck-pulse-ring" />
            )}
            <circle cx={cx} cy={cy} r={r}
              fill={isCurrent ? 'var(--ck-accent)' : color}
              stroke={isCurrent ? 'var(--ck-accent)' : color}
              strokeWidth=".5" />
            {node.type === 'PLANET' && (
              <text x={cx} y={cy - r - 2} textAnchor="middle"
                fill={isCurrent ? 'var(--ck-accent)' : color}
                fontSize="4.5"
                fontFamily="'Share Tech Mono',monospace">
                {node.name.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {/* Other players */}
      {playerNodes
        .filter(p => !p.isMe && p.nodeId > 0)
        .map((p, i) => {
          const node = MAP_NODES.find(n => n.id === p.nodeId);
          if (!node) return null;
          const [cx, cy] = nodeToSvg(node.position[0], node.position[2]);
          return (
            <circle key={i} cx={cx + 3} cy={cy - 3} r={2}
              fill="var(--ck-green)" stroke="var(--ck-green)" strokeWidth=".5" opacity=".8" />
          );
        })}
    </svg>
  );
}

// ─── Reputation bar (3-segment: -1 / 0 / +1) ─────────────────────────────────

function RepBar({ faction, value, color }: { faction: string; value: number; color: string }) {
  const label = value > 0 ? 'POSITIVE' : value < 0 ? 'NEGATIVE' : 'NEUTRAL';
  const labelColor = value > 0 ? 'var(--ck-green)' : value < 0 ? 'var(--ck-red)' : 'var(--ck-dim)';

  const segColor = (seg: number): string => {
    if (seg === value) return color;
    if (seg < value && value > 0) return `${color}44`;
    return 'var(--ck-border)';
  };

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, color, letterSpacing: '.08em' }}>{faction}</span>
        <span style={{ fontSize: 8, fontFamily: "'Share Tech Mono',monospace", color: labelColor }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {([-1, 0, 1] as const).map(seg => (
          <div key={seg} style={{ flex: 1, height: 4, borderRadius: 1, background: segColor(seg) }} />
        ))}
      </div>
    </div>
  );
}

// ─── Segment health/hull track ────────────────────────────────────────────────

function SegmentTrack({ current, max, color }: { current: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 2 }}>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} style={{
          width: 9, height: 9, borderRadius: 2,
          background: i < current ? color : 'var(--ck-border)',
          border: `1px solid ${i < current ? color + '80' : 'var(--ck-border)'}`,
        }} />
      ))}
    </div>
  );
}

// ─── Settings button ──────────────────────────────────────────────────────────

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="Settings"
      style={{
        background: 'none',
        border: '1px solid var(--ck-border)',
        borderRadius: 3,
        color: 'var(--ck-dim)',
        fontSize: 14,
        width: 28,
        height: 28,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      ⚙
    </button>
  );
}

// ─── Phase helpers ────────────────────────────────────────────────────────────

function phaseColor(phase: GamePhase): string {
  switch (phase) {
    case 'PLANNING':  return 'var(--ck-accent)';
    case 'ACTION':    return 'var(--ck-gold)';
    case 'ENCOUNTER': return 'var(--ck-green)';
    case 'COMBAT':    return 'var(--ck-red)';
    default:          return 'var(--ck-text)';
  }
}

function phaseLabel(phase: GamePhase, isMyTurn: boolean, activeName?: string): string {
  if (!isMyTurn) return activeName ? `${activeName.toUpperCase()}'S TURN` : 'WAITING';
  switch (phase) {
    case 'PLANNING':  return 'PLANNING PHASE';
    case 'ACTION':    return 'ACTION PHASE';
    case 'ENCOUNTER': return 'ENCOUNTER PHASE';
    case 'COMBAT':    return 'COMBAT';
    case 'WIN_CHECK': return 'CHECKING FAME';
    default:          return phase.replace(/_/g, ' ');
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BOTTOM_H = 270;

const S: Record<string, React.CSSProperties> = {
  root: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 10,
    fontFamily: "'Share Tech Mono', monospace",
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 44,
    background: '#0a1828',
    borderBottom: '1px solid var(--ck-border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 14px',
    gap: 14,
    flexShrink: 0,
  },
  headerDiv: {
    width: 1, height: 22,
    background: 'var(--ck-border)',
  },
  headerVal: {
    fontFamily: "'Share Tech Mono',monospace",
    fontSize: 11,
    color: 'var(--ck-val)',
    marginTop: 1,
  },
  badgeWrap: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  badge: {
    padding: '4px 14px',
    border: '1px solid',
    borderRadius: 3,
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 9,
    letterSpacing: '.12em',
  },
  fameBarBg: {
    width: 80, height: 5,
    background: 'var(--ck-panel)',
    borderRadius: 1,
    overflow: 'hidden',
    border: '1px solid var(--ck-border)',
  },
  fameBarFill: {
    height: '100%',
    background: 'var(--ck-accent)',
    transition: 'width 0.5s ease',
  },
  minimapPanel: {
    position: 'absolute',
    bottom: 0, left: 0,
    width: 175,
    height: BOTTOM_H,
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: '0 4px 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  minimapFooter: {
    padding: '4px 8px 6px',
    borderTop: '1px solid var(--ck-border)',
  },
  systemsPanel: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 155,
    height: BOTTOM_H,
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: '4px 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '6px 8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  shipStatus: {
    borderTop: '1px solid var(--ck-border)',
    padding: '7px 8px',
    flexShrink: 0,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  statNum: {
    fontSize: 10,
    color: 'var(--ck-accent)',
    fontFamily: "'Share Tech Mono',monospace",
  },
};

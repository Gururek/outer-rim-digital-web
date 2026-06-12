import { useState } from 'react';
import { CHARACTERS, SHIPS } from '@outer-rim/shared';
import type { CharacterDefinition } from '@outer-rim/shared';
import SettingsPanel from './SettingsPanel';

// ─── Character portrait (procedural SVG — no image files needed) ──────────────
const SKILL_COLOR: Record<string, string> = {
  INFLUENCE: '#f1c40f', STRENGTH:  '#e74c3c', KNOWLEDGE: '#1abc9c',
  TACTICS:   '#e67e22', PILOTING:  '#3498db', STEALTH:   '#9b59b6', TECH: '#00bcd4',
};
const FACTION_ACCENT: Record<string, string> = {
  IMPERIAL: '#1a5276', REBEL: '#2e7d32', HUTT: '#d4a017', SYNDICATE: '#8b0000',
};

function CharacterPortrait({ char }: { char: CharacterDefinition }) {
  const primary  = SKILL_COLOR[char.skills[0]] ?? '#4da6ff';
  const faction  = char.startingReputation?.faction;
  const fAccent  = faction ? (FACTION_ACCENT[faction] ?? '#333') : '#2a3a4a';
  const initials = char.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const hp       = Math.min(char.maxHealth, 9);
  const id       = char.id;
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={`rg_${id}`} cx="50%" cy="38%" r="65%">
          <stop offset="0%"   stopColor={primary} stopOpacity="0.28" />
          <stop offset="100%" stopColor="#060d18"  stopOpacity="1"   />
        </radialGradient>
      </defs>
      {/* Hex background */}
      <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill={`url(#rg_${id})`} />
      {/* Hex border */}
      <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke={primary} strokeWidth="1.4" opacity="0.55" />
      {/* Faction colour band at top */}
      <polygon points="30,2 58,16 42,16 18,16 2,16" fill={fAccent} opacity="0.75" />
      {/* Initials */}
      <text x="30" y="35" textAnchor="middle" dominantBaseline="middle"
        fontFamily="'Orbitron',sans-serif" fontSize="19" fontWeight="bold"
        fill={primary} fillOpacity="0.92">{initials}</text>
      {/* Health dots */}
      <g transform={`translate(30,50)`}>
        {Array.from({ length: hp }).map((_, i) => (
          <circle key={i} cx={(i - (hp - 1) / 2) * 5.5} cy={0} r={2}
            fill={primary} fillOpacity="0.65" />
        ))}
      </g>
    </svg>
  );
}

interface Props {
  onConnect: (options?: Record<string, unknown>) => Promise<string | undefined>;
  onJoin:    (code: string, options?: Record<string, unknown>) => Promise<string | undefined>;
}

export default function LobbyScreen({ onConnect, onJoin }: Props) {
  const [displayName, setDisplayName] = useState('Scoundrel');
  const [roomCode,    setRoomCode]    = useState('');
  const [charId,      setCharId]      = useState(CHARACTERS[0].id);
  const [shipId,      setShipId]      = useState(SHIPS[0].id);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const selectedChar = CHARACTERS.find(c => c.id === charId);
  const selectedShip = SHIPS.find(s => s.id === shipId);

  const handleCreate = async () => {
    setLoading(true); setError('');
    try { await onConnect({ displayName, characterId: charId, shipId, fameRequirement: 10 }); }
    catch { setError('Could not create game. Is the server running?'); }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setLoading(true); setError('');
    try { await onJoin(roomCode.trim(), { displayName, characterId: charId, shipId }); }
    catch { setError('Could not join room. Check the code and try again.'); }
    setLoading(false);
  };

  return (
    <div style={S.backdrop}>
      {/* Scanline */}
      <div className="ck-scan" />

      <div style={S.card}>
        <button
          onClick={() => setShowSettings(true)}
          title="Settings"
          style={S.gearBtn}
        >⚙</button>

        {/* Title */}
        <div style={S.titleBlock}>
          <div style={S.starWars}>STAR WARS</div>
          <div style={S.subtitle}>OUTER RIM — DIGITAL</div>
          <div style={S.divider} />
        </div>

        {/* Name */}
        <div style={S.field}>
          <label className="ck-label" style={{ display: 'block', marginBottom: 5 }}>CALLSIGN</label>
          <input style={S.input} value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={24} />
        </div>

        {/* Character select */}
        <div style={S.field}>
          <label className="ck-label" style={{ display: 'block', marginBottom: 5 }}>CHARACTER</label>
          <select style={S.select} value={charId} onChange={e => setCharId(e.target.value)}>
            {CHARACTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selectedChar && (
            <div style={S.charDetail}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <CharacterPortrait char={selectedChar} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.skillRow}>
                    {selectedChar.skills.map(s => (
                      <span key={s} style={{ ...S.skillTag, background: `${SKILL_COLOR[s]}18`, borderColor: `${SKILL_COLOR[s]}44`, color: SKILL_COLOR[s] ?? 'var(--ck-accent)' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--ck-dim)', marginTop: 5, lineHeight: 1.4, fontStyle: 'italic' }}>
                    {selectedChar.personalGoal}
                  </div>
                  <div style={{ marginTop: 5, fontSize: 8, color: 'var(--ck-dim)' }}>
                    HP <span style={{ color: 'var(--ck-val)' }}>{selectedChar.maxHealth}</span>
                    {'  '}FIGHT <span style={{ color: 'var(--ck-val)' }}>{selectedChar.groundCombatValue}</span>
                    {selectedChar.startingReputation && (
                      <>{'  '}<span style={{ color: FACTION_ACCENT[selectedChar.startingReputation.faction] ?? 'var(--ck-dim)' }}>
                        {selectedChar.startingReputation.faction}+
                      </span></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ship select */}
        <div style={S.field}>
          <label className="ck-label" style={{ display: 'block', marginBottom: 5 }}>SHIP</label>
          <select style={S.select} value={shipId} onChange={e => setShipId(e.target.value)}>
            {SHIPS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {selectedShip && (
            <div style={S.shipDetail}>
              <StatPill label="HYPERDRIVE" value={selectedShip.hyperdrive} />
              <StatPill label="HULL"       value={selectedShip.maxHull} />
              <StatPill label="COMBAT"     value={selectedShip.shipCombatValue} />
              <StatPill label="CARGO"      value={selectedShip.cargoSlots} />
            </div>
          )}
        </div>

        {error && <div style={S.errorBox}>{error}</div>}

        {/* Buttons */}
        <button style={S.createBtn} onClick={handleCreate} disabled={loading}>
          {loading ? 'CONNECTING...' : 'CREATE GAME'}
        </button>

        <div style={S.orRow}>
          <div style={S.orLine} />
          <span style={S.orText}>OR JOIN</span>
          <div style={S.orLine} />
        </div>

        <div style={{ display: 'flex', gap: 7 }}>
          <input
            style={{ ...S.input, flex: 1, letterSpacing: '.15em', textAlign: 'center' }}
            placeholder="ROOM CODE"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value.toUpperCase())}
            maxLength={12}
          />
          <button style={S.joinBtn} onClick={handleJoin} disabled={loading || !roomCode.trim()}>
            JOIN
          </button>
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 7, color: 'var(--ck-dim)', letterSpacing: '.08em' }}>{label}</span>
      <span style={{ fontFamily: "'Share Tech Mono',monospace", fontSize: 12, color: 'var(--ck-accent)', marginTop: 1 }}>{value}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--ck-bg)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  card: {
    position: 'relative',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    padding: '2rem',
    width: 400,
    maxWidth: '92vw',
    zIndex: 1,
  },
  gearBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'none',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
    color: 'var(--ck-dim)',
    fontSize: 16,
    width: 30,
    height: 30,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
    zIndex: 2,
  },
  titleBlock: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  starWars: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.8rem',
    color: 'var(--ck-gold)',
    letterSpacing: '.3em',
    fontWeight: 600,
  },
  subtitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.7rem',
    color: 'var(--ck-dim)',
    letterSpacing: '.25em',
    marginTop: '.25rem',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--ck-border), transparent)',
    margin: '1rem 0 0',
  },
  field: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    color: 'var(--ck-val)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    color: 'var(--ck-val)',
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
  },
  charDetail: {
    marginTop: 6,
    padding: '6px 8px',
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
  },
  skillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    padding: '2px 5px',
    borderRadius: 2,
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.05em',
    background: 'rgba(77,166,255,.12)',
    border: '1px solid rgba(77,166,255,.25)',
    color: 'var(--ck-accent)',
  },
  shipDetail: {
    marginTop: 6,
    padding: '8px 10px',
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
    display: 'flex',
    justifyContent: 'space-around',
  },
  errorBox: {
    fontSize: 9,
    color: 'var(--ck-red)',
    border: '1px solid rgba(224,85,85,.3)',
    borderRadius: 3,
    padding: '6px 10px',
    marginBottom: '0.75rem',
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.06em',
  },
  createBtn: {
    width: '100%',
    padding: '10px',
    background: 'rgba(77,166,255,.12)',
    border: '1px solid var(--ck-accent)',
    borderRadius: 4,
    color: 'var(--ck-accent)',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 10,
    letterSpacing: '.15em',
    cursor: 'pointer',
    marginBottom: '0.75rem',
  },
  orRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: '0.75rem',
  },
  orLine: {
    flex: 1,
    height: 1,
    background: 'var(--ck-border)',
  },
  orText: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.12em',
  },
  joinBtn: {
    padding: '8px 16px',
    background: 'var(--ck-panel2)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    color: 'var(--ck-val)',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 10,
    letterSpacing: '.1em',
    cursor: 'pointer',
    flexShrink: 0,
  },
};

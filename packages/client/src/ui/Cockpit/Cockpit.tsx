import { useGameStore } from '../../stores/gameStore';
import type { FactionType } from '@outer-rim/shared';
import { getShip, CHARACTERS } from '@outer-rim/shared';

export default function CockpitOverlay() {
  const phase = useGameStore(s => s.phase);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players = useGameStore(s => s.players);
  const turnNumber = useGameStore(s => s.turnNumber);
  const fameRequirement = useGameStore(s => s.fameRequirement);

  const myPlayer = players.get(mySessionId);
  if (!myPlayer) return null;

  const character = CHARACTERS.find(c => c.id === myPlayer.characterId);
  const maxHealth = character?.maxHealth ?? 8;
  const ship = getShip(myPlayer.shipId);
  const maxHull = ship?.maxHull ?? 6;

  const isMyTurn = activePlayerId === mySessionId;
  const activePlayer = players.get(activePlayerId);

  return (
    <div style={styles.overlay}>
      {/* Top bar: Phase + Turn info */}
      <div style={styles.topBar}>
        <div style={styles.phaseIndicator}>
          <span style={styles.phaseLabel}>PHASE</span>
          <span style={styles.phaseValue}>{phase.replace(/_/g, ' ')}</span>
        </div>
        <div style={styles.turnInfo}>
          <span style={styles.turnLabel}>TURN {turnNumber}</span>
          {isMyTurn && <span style={styles.yourTurn}>YOUR TURN</span>}
          {!isMyTurn && activePlayer && (
            <span style={styles.waitingTurn}>{activePlayer.displayName}'s turn</span>
          )}
        </div>
        <div style={styles.fameDisplay}>
          <span style={styles.fameLabel}>FAME</span>
          <span style={styles.fameValue}>{myPlayer.fame} / {fameRequirement}</span>
        </div>
      </div>

      {/* Bottom bar: HUD status */}
      <div style={styles.bottomBar}>
        <HUDStat label="CREDITS" value={`${myPlayer.credits} cr`} />
        <HUDStat label="HULL" value={`${maxHull - (myPlayer.shipDamage)}/${maxHull}`} color={myPlayer.shipDamage > 0 ? '#ff4444' : '#00ffcc'} />
        <HUDStat label="HEALTH" value={`${maxHealth - (myPlayer.characterDamage)}/${maxHealth}`} color={myPlayer.characterDamage > 0 ? '#ff8844' : '#00ffcc'} />
        <ReputationHUD rep={myPlayer.rep} />
      </div>
    </div>
  );
}

function HUDStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color: color || '#00ffcc' }}>{value}</span>
    </div>
  );
}

function ReputationHUD({ rep }: { rep: Record<FactionType, number> }) {
  const factions: { key: FactionType; label: string; color: string }[] = [
    { key: 'HUTT', label: 'HUTT', color: '#d4a017' },
    { key: 'SYNDICATE', label: 'SYN', color: '#8b0000' },
    { key: 'IMPERIAL', label: 'IMP', color: '#1a5276' },
    { key: 'REBEL', label: 'REB', color: '#2e7d32' },
  ];

  const repSymbol = (v: number) => v > 0 ? '▲' : v < 0 ? '▼' : '─';
  const repColor = (v: number) => v > 0 ? '#4caf50' : v < 0 ? '#f44336' : '#888888';

  return (
    <div style={styles.repContainer}>
      {factions.map(f => (
        <div key={f.key} style={styles.repItem}>
          <span style={{ color: f.color, fontSize: '0.65rem' }}>{f.label}</span>
          <span style={{ color: repColor(rep[f.key] ?? 0), fontSize: '0.7rem' }}>
            {repSymbol(rep[f.key] ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '1rem',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'rgba(0, 0, 0, 0.5)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.75rem 1.25rem',
    borderRadius: '0 0 8px 8px',
  },
  phaseIndicator: {
    display: 'flex',
    flexDirection: 'column',
  },
  phaseLabel: {
    fontSize: '0.6rem',
    color: '#666',
    letterSpacing: '0.15em',
  },
  phaseValue: {
    fontSize: '0.9rem',
    color: '#ffd700',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  turnInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  turnLabel: {
    fontSize: '0.7rem',
    color: '#888',
  },
  yourTurn: {
    fontSize: '0.85rem',
    color: '#00ff88',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0, 255, 136, 0.3)',
  },
  waitingTurn: {
    fontSize: '0.75rem',
    color: '#aaaaaa',
  },
  fameDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  fameLabel: {
    fontSize: '0.6rem',
    color: '#666',
    letterSpacing: '0.15em',
  },
  fameValue: {
    fontSize: '0.9rem',
    color: '#ffd700',
    fontWeight: 'bold',
  },

  bottomBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    background: 'rgba(0, 0, 0, 0.5)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px 8px 0 0',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '0.55rem',
    color: '#666',
    letterSpacing: '0.1em',
  },
  statValue: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  repContainer: {
    display: 'flex',
    gap: '0.6rem',
  },
  repItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

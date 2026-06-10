import { useGameStore } from '../stores/gameStore';
import { CHARACTERS } from '@outer-rim/shared';

interface GameOverScreenProps {
  onReturnToLobby: () => void;
}

export default function GameOverScreen({ onReturnToLobby }: GameOverScreenProps) {
  const gameOver = useGameStore(s => s.gameOver);
  const players = useGameStore(s => s.players);
  const mySessionId = useGameStore(s => s.mySessionId);

  const isWinner = gameOver.winnerId === mySessionId;
  const char = CHARACTERS.find(c => {
    const winner = players.get(gameOver.winnerId);
    return winner ? c.id === winner.characterId : false;
  });

  const sortedPlayers = Array.from(players.entries())
    .sort(([, a], [, b]) => b.fame - a.fame);

  return (
    <div style={styles.backdrop}>
      <div style={styles.card}>
        <div style={styles.borderGlow} />
        <h1 style={styles.title}>
          {isWinner ? 'VICTORY' : 'GAME OVER'}
        </h1>
        <div style={styles.winnerSection}>
          <div style={styles.winnerName}>
            {gameOver.winnerName || 'Unknown'}
          </div>
          {char && (
            <div style={styles.winnerChar}>
              {char.name} · {char.ship}
            </div>
          )}
          <div style={styles.fameDisplay}>
            <span style={styles.fameLabel}>FINAL FAME</span>
            <span style={styles.fameValue}>{gameOver.winnerFame}</span>
            <span style={styles.fameMax}>/ {10}</span>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.standingsTitle}>FINAL STANDINGS</h2>
        <div style={styles.standings}>
          {sortedPlayers.map(([id, p], i) => (
            <div key={id} style={{
              ...styles.standingRow,
              background: id === gameOver.winnerId
                ? 'rgba(255, 215, 0, 0.12)'
                : i % 2 ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={styles.pName}>{p.displayName}</span>
              <span style={styles.pChar}>
                {CHARACTERS.find(c => c.id === p.characterId)?.name ?? '—'}
              </span>
              <span style={styles.pFame}>{p.fame} FP</span>
            </div>
          ))}
        </div>

        <button style={styles.lobbyBtn} onClick={onReturnToLobby}>
          RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    fontFamily: 'monospace',
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 100%)',
    border: '2px solid rgba(255, 215, 0, 0.4)',
    borderRadius: 12,
    padding: '2.5rem 3rem',
    minWidth: 420,
    maxWidth: 560,
    boxShadow: '0 0 40px rgba(255, 215, 0, 0.15)',
    textAlign: 'center',
  },
  borderGlow: {
    position: 'absolute', top: -2, left: -2, right: -2, bottom: -2,
    borderRadius: 12,
    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), transparent 50%, rgba(255,215,0,0.1))',
    zIndex: -1,
  },
  title: {
    fontSize: '2.2rem',
    color: '#ffd700',
    fontWeight: 900,
    letterSpacing: '0.3em',
    margin: '0 0 1.5rem 0',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  winnerSection: {
    marginBottom: '1.5rem',
  },
  winnerName: {
    fontSize: '1.6rem',
    color: '#ffd700',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
  },
  winnerChar: {
    fontSize: '0.85rem',
    color: '#888',
    marginTop: '0.3rem',
  },
  fameDisplay: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '0.4rem',
  },
  fameLabel: {
    fontSize: '0.7rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  fameValue: {
    fontSize: '2.5rem',
    color: '#ffd700',
    fontWeight: 900,
  },
  fameMax: {
    fontSize: '1rem',
    color: '#555',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent)',
    margin: '1.5rem 0',
  },
  standingsTitle: {
    fontSize: '0.7rem',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    marginBottom: '0.8rem',
  },
  standings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  standingRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem 0.8rem',
    borderRadius: 4,
    fontSize: '0.85rem',
  },
  rank: {
    width: 28,
    color: '#ffd700',
    fontWeight: 'bold',
  },
  pName: {
    flex: 1,
    color: '#ccc',
    textAlign: 'left',
  },
  pChar: {
    color: '#666',
    marginRight: '1rem',
    fontSize: '0.75rem',
  },
  pFame: {
    color: '#ffd700',
    fontWeight: 'bold',
    width: 50,
    textAlign: 'right',
  },
  lobbyBtn: {
    marginTop: '2rem',
    padding: '0.7rem 2rem',
    background: 'transparent',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: 6,
    color: '#ffd700',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    letterSpacing: '0.15em',
    cursor: 'pointer',
  },
};

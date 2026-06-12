import { useGameStore } from '../stores/gameStore';
import { CHARACTERS } from '@outer-rim/shared';

interface Props {
  onReturnToLobby: () => void;
}

export default function GameOverScreen({ onReturnToLobby }: Props) {
  const gameOver = useGameStore(s => s.gameOver);
  const players  = useGameStore(s => s.players);
  const myId     = useGameStore(s => s.mySessionId);

  const isWinner = gameOver.winnerId === myId;
  const winner   = players.get(gameOver.winnerId);
  const char     = CHARACTERS.find(c => winner && c.id === winner.characterId);

  const sorted = Array.from(players.entries()).sort(([, a], [, b]) => b.fame - a.fame);

  return (
    <div style={S.backdrop}>
      <div className="ck-scan" />
      <div style={S.card}>
        <div style={{ height: 3, background: isWinner ? 'var(--ck-gold)' : 'var(--ck-accent)', opacity: .8 }} />
        <div style={S.body}>
          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '2rem', color: isWinner ? 'var(--ck-gold)' : 'var(--ck-text)', letterSpacing: '.3em', fontWeight: 600, marginBottom: '1.2rem' }}>
            {isWinner ? 'VICTORY' : 'GAME OVER'}
          </div>

          <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '1.2rem', color: 'var(--ck-val)', letterSpacing: '.08em', marginBottom: '.25rem' }}>
            {gameOver.winnerName || 'Unknown'}
          </div>
          {char && (
            <div style={{ fontSize: 9, color: 'var(--ck-dim)', marginBottom: '1.2rem', fontFamily: "'Share Tech Mono',monospace" }}>
              {char.name} · {char.personalGoal}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8, marginBottom: '1.5rem' }}>
            <span className="ck-label">FINAL FAME</span>
            <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: '2.5rem', color: 'var(--ck-gold)', fontWeight: 600 }}>
              {gameOver.winnerFame}
            </span>
          </div>

          <div style={S.divider} />

          <div className="ck-label" style={{ marginBottom: 8 }}>FINAL STANDINGS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: '1.5rem' }}>
            {sorted.map(([id, p], i) => (
              <div key={id} style={{
                ...S.standRow,
                background: id === gameOver.winnerId ? 'rgba(245,160,32,.08)' : i % 2 ? 'var(--ck-panel)' : 'transparent',
                borderColor: id === gameOver.winnerId ? 'rgba(245,160,32,.2)' : 'var(--ck-border)',
              }}>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: 'var(--ck-gold)', width: 20 }}>#{i + 1}</span>
                <span style={{ flex: 1, color: 'var(--ck-val)', fontSize: 11 }}>{p.displayName}</span>
                <span style={{ color: 'var(--ck-dim)', fontSize: 9, marginRight: 10 }}>
                  {CHARACTERS.find(c => c.id === p.characterId)?.name ?? '—'}
                </span>
                <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: 'var(--ck-gold)' }}>
                  {p.fame} FP
                </span>
              </div>
            ))}
          </div>

          <button style={S.lobbyBtn} onClick={onReturnToLobby}>
            RETURN TO LOBBY
          </button>
        </div>
        <div style={{ height: 3, background: isWinner ? 'var(--ck-gold)' : 'var(--ck-accent)', opacity: .8 }} />
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(6,13,24,.9)',
    fontFamily: "'Share Tech Mono', monospace",
  },
  card: {
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    width: 420,
    maxWidth: '92vw',
    overflow: 'hidden',
  },
  body: {
    padding: '2rem 2.5rem',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, var(--ck-border), transparent)',
    margin: '1.2rem 0 1rem',
  },
  standRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: 3,
    border: '1px solid',
  },
  lobbyBtn: {
    padding: '8px 24px',
    background: 'transparent',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    color: 'var(--ck-text)',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 9,
    letterSpacing: '.15em',
    cursor: 'pointer',
  },
};

import { useGameStore } from '../../../stores/gameStore';

export default function CargoTab() {
  const players = useGameStore(s => s.players);
  const mySessionId = useGameStore(s => s.mySessionId);
  const myPlayer = players.get(mySessionId);

  if (!myPlayer) {
    return <p style={styles.text}>Not connected.</p>;
  }

  return (
    <div>
      <h3 style={styles.heading}>CARGO HOLD</h3>
      <p style={styles.text}>Credits: {myPlayer.credits} cr</p>
      <p style={styles.text}>Fame: {myPlayer.fame}</p>

      <h4 style={styles.subheading}>Ship Status</h4>
      <div style={styles.statusGrid}>
        <StatusItem label="Hull Damage" value={myPlayer.shipDamage} max={6} color="#ff4444" />
        <StatusItem label="Char Damage" value={myPlayer.characterDamage} max={8} color="#ff8844" />
      </div>

      <h4 style={styles.subheading}>Reputation</h4>
      <div style={styles.repGrid}>
        <RepItem faction="Hutt" value={myPlayer.rep.HUTT} color="#d4a017" />
        <RepItem faction="Syndicate" value={myPlayer.rep.SYNDICATE} color="#8b0000" />
        <RepItem faction="Imperial" value={myPlayer.rep.IMPERIAL} color="#1a5276" />
        <RepItem faction="Rebel" value={myPlayer.rep.REBEL} color="#2e7d32" />
      </div>
    </div>
  );
}

function StatusItem({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: '0.3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.1rem' }}>
        <span style={{ color: '#888' }}>{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div style={styles.barBg}>
        <div style={{ ...styles.barFill, width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function RepItem({ faction, value, color }: { faction: string; value: number; color: string }) {
  const label = value > 0 ? 'Positive' : value < 0 ? 'Negative' : 'Neutral';
  const barColor = value > 0 ? '#4caf50' : value < 0 ? '#f44336' : '#888';
  return (
    <div style={styles.repItem}>
      <span style={{ color, fontSize: '0.7rem' }}>{faction}</span>
      <span style={{ color: barColor, fontSize: '0.65rem' }}>{label}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '0.85rem', color: '#ffd700', marginBottom: '0.5rem' },
  subheading: { fontSize: '0.75rem', color: '#888', marginTop: '0.75rem', marginBottom: '0.4rem' },
  text: { fontSize: '0.75rem', color: '#ccc', marginBottom: '0.2rem' },
  statusGrid: { display: 'flex', flexDirection: 'column' },
  repGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' },
  repItem: { display: 'flex', flexDirection: 'column', padding: '0.3rem', background: 'rgba(255,255,255,0.03)', borderRadius: '3px' },
  barBg: { width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.3s' },
};

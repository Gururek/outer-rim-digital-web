import { useState } from 'react';
import { CHARACTERS, SHIPS } from '@outer-rim/shared';

interface Props {
  onConnect: (options?: Record<string, unknown>) => Promise<string | undefined>;
  onJoin: (code: string, options?: Record<string, unknown>) => Promise<string | undefined>;
}

export default function LobbyScreen({ onConnect, onJoin }: Props) {
  const [displayName, setDisplayName] = useState('Scoundrel');
  const [roomCode, setRoomCode] = useState('');
  const [characterId, setCharacterId] = useState(CHARACTERS[0].id);
  const [shipId, setShipId] = useState(SHIPS[0].id);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onConnect({ displayName, characterId, shipId, fameRequirement: 10 });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      await onJoin(roomCode, { displayName, characterId, shipId });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>STAR WARS</h1>
        <h2 style={styles.subtitle}>OUTER RIM — DIGITAL</h2>

        <div style={styles.section}>
          <label style={styles.label}>Display Name</label>
          <input
            style={styles.input}
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Character</label>
          <select style={styles.select} value={characterId} onChange={e => setCharacterId(e.target.value)}>
            {CHARACTERS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Ship</label>
          <select style={styles.select} value={shipId} onChange={e => setShipId(e.target.value)}>
            {SHIPS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.buttons}>
          <button style={styles.btn} onClick={handleCreate} disabled={loading}>
            {loading ? 'Connecting...' : 'Create Game'}
          </button>

          <div style={styles.divider}>
            <span>— or join —</span>
          </div>

          <input
            style={styles.input}
            placeholder="Room Code"
            value={roomCode}
            onChange={e => setRoomCode(e.target.value)}
          />
          <button style={styles.btn} onClick={handleJoin} disabled={loading || !roomCode.trim()}>
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'radial-gradient(ellipse at center, #0a1a2e 0%, #000 70%)',
  },
  card: {
    background: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '2.5rem',
    maxWidth: '420px',
    width: '100%',
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center',
    letterSpacing: '0.3em',
    color: '#ffd700',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    textAlign: 'center',
    color: '#888',
    marginBottom: '2rem',
    letterSpacing: '0.2em',
  },
  section: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.9rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.6rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.9rem',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  btn: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #d4a017, #ffd700)',
    border: 'none',
    borderRadius: '6px',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  divider: {
    textAlign: 'center',
    color: '#555',
    fontSize: '0.8rem',
  },
};

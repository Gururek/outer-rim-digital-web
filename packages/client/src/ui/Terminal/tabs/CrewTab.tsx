import { useGameStore } from '../../../stores/gameStore';
import { CHARACTERS, getCharacter } from '@outer-rim/shared';

export default function CrewTab() {
  const players = useGameStore(s => s.players);
  const mySessionId = useGameStore(s => s.mySessionId);
  const myPlayer = players.get(mySessionId);

  if (!myPlayer) {
    return <p style={styles.text}>Not connected.</p>;
  }

  const character = getCharacter(myPlayer.characterId);

  return (
    <div>
      <h3 style={styles.heading}>CREW & STATUS</h3>

      {character ? (
        <div style={styles.charCard}>
          <div style={styles.charHeader}>
            <span style={styles.charName}>{character.name}</span>
            <span style={styles.charHP}>HP: {character.maxHealth - myPlayer.characterDamage}/{character.maxHealth}</span>
          </div>

          <h4 style={styles.subheading}>Skills</h4>
          <div style={styles.skillGrid}>
            {character.skills.map(skill => (
              <span key={skill} style={styles.skillPill}>{skill}</span>
            ))}
          </div>

          <h4 style={styles.subheading}>Goal</h4>
          <p style={styles.goalText}>{character.personalGoal}</p>
        </div>
      ) : (
        <p style={styles.text}>Character: {myPlayer.characterId || 'None selected'}</p>
      )}

      <h4 style={styles.subheading}>Inventory</h4>
      <p style={styles.text}>Ship: {myPlayer.shipId || 'None'}</p>
      <div style={styles.slotGrid}>
        <div style={styles.slotItem}>
          <span style={styles.slotLabel}>Cargo</span>
          <span style={styles.slotCount}>{myPlayer.cargoSlots.length}/3</span>
        </div>
        <div style={styles.slotItem}>
          <span style={styles.slotLabel}>Crew</span>
          <span style={styles.slotCount}>{myPlayer.crewSlots.length}/2</span>
        </div>
        <div style={styles.slotItem}>
          <span style={styles.slotLabel}>Gear</span>
          <span style={styles.slotCount}>{myPlayer.gearSlots.length}/2</span>
        </div>
        <div style={styles.slotItem}>
          <span style={styles.slotLabel}>Mods</span>
          <span style={styles.slotCount}>{myPlayer.modSlots.length}/2</span>
        </div>
        <div style={styles.slotItem}>
          <span style={styles.slotLabel}>Jobs</span>
          <span style={styles.slotCount}>{myPlayer.jobBountySlots.length}/2</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: '0.85rem', color: '#ffd700', marginBottom: '0.5rem' },
  subheading: { fontSize: '0.7rem', color: '#888', marginTop: '0.6rem', marginBottom: '0.3rem', textTransform: 'uppercase' as const },
  text: { fontSize: '0.75rem', color: '#ccc' },
  charCard: {
    padding: '0.5rem',
    background: 'rgba(255, 215, 0, 0.05)',
    border: '1px solid rgba(255, 215, 0, 0.15)',
    borderRadius: '4px',
  },
  charHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charName: {
    fontSize: '0.85rem',
    color: '#ffd700',
    fontWeight: 'bold',
  },
  charHP: {
    fontSize: '0.7rem',
    color: '#ff8844',
  },
  skillGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
  },
  skillPill: {
    padding: '0.15rem 0.5rem',
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    borderRadius: '10px',
    fontSize: '0.6rem',
    color: '#00ff88',
  },
  goalText: {
    fontSize: '0.7rem',
    color: '#999',
    fontStyle: 'italic',
  },
  slotGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.3rem',
  },
  slotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.3rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '3px',
  },
  slotLabel: {
    fontSize: '0.65rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  slotCount: {
    fontSize: '0.7rem',
    color: '#aaa',
  },
};

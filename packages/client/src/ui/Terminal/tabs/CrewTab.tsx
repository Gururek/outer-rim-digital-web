import { useGameStore } from '../../../stores/gameStore';
import { getCharacter, getShip, getCardById } from '@outer-rim/shared';

export default function CrewTab() {
  const players = useGameStore(s => s.players);
  const myId    = useGameStore(s => s.mySessionId);
  const me      = players.get(myId);

  if (!me) return <p style={S.dim}>Not connected.</p>;

  const char = getCharacter(me.characterId);
  const ship = getShip(me.shipId);

  const gearCards = me.gearSlots.map(id => getCardById(id)).filter(Boolean);
  const modCards  = me.modSlots.map(id => getCardById(id)).filter(Boolean);
  const crewCards = me.crewSlots.map(id => getCardById(id)).filter(Boolean);

  return (
    <div>
      {/* Character card */}
      {char && (
        <div style={S.charCard}>
          <div style={S.charHead}>
            <div>
              <div style={S.charName}>{char.name}</div>
              <div style={{ fontSize: 9, color: 'var(--ck-dim)', marginTop: 1 }}>{ship?.name ?? '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="ck-label" style={{ marginBottom: 2 }}>HEALTH</div>
              <div style={{ fontSize: 10, color: me.characterDamage > 0 ? 'var(--ck-red)' : 'var(--ck-green)' }}>
                {char.maxHealth - me.characterDamage} / {char.maxHealth}
              </div>
            </div>
          </div>

          <div className="ck-label" style={{ marginTop: 8, marginBottom: 4 }}>SKILLS ACTIVE</div>
          <div style={S.skillRow}>
            {char.skills.map(skill => (
              <span key={skill} style={S.skillTag}>{skill}</span>
            ))}
          </div>

          <div style={{ marginTop: 8, padding: 7, background: 'var(--ck-bg)', border: '1px solid var(--ck-border)', borderRadius: 3 }}>
            <div className="ck-label" style={{ marginBottom: 2 }}>PERSONAL GOAL</div>
            <div style={{ fontSize: 10, color: 'var(--ck-text)', lineHeight: 1.4 }}>{char.personalGoal}</div>
          </div>
        </div>
      )}

      {/* Gear */}
      {gearCards.length > 0 && (
        <>
          <div style={S.sectionHead}>GEAR — {gearCards.length} / {char?.gearSlots ?? 2}</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {gearCards.map((card, i) => card && (
              <div key={i} style={S.itemRow}>
                <span style={{ fontSize: 10, color: 'var(--ck-val)' }}>{card.name}</span>
                <span style={S.badge}>GEAR</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mods */}
      {modCards.length > 0 && (
        <>
          <div style={{ ...S.sectionHead, marginTop: 10 }}>SHIP MODS — {modCards.length}</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {modCards.map((card, i) => card && (
              <div key={i} style={S.itemRow}>
                <span style={{ fontSize: 10, color: 'var(--ck-val)' }}>{card.name}</span>
                <span style={S.badge}>MOD</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Crew */}
      {crewCards.length > 0 && (
        <>
          <div style={{ ...S.sectionHead, marginTop: 10 }}>CREW — {crewCards.length} / {ship?.crewSlots ?? 1}</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {crewCards.map((card, i) => card && (
              <div key={i} style={S.crewCard}>
                <div style={{ fontSize: 11, color: 'var(--ck-val)', marginBottom: 4 }}>{card.name}</div>
                <div style={{ fontSize: 9, color: 'var(--ck-text)' }}>{card.effectDescription}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {gearCards.length === 0 && modCards.length === 0 && crewCards.length === 0 && (
        <p style={{ ...S.dim, marginTop: 10 }}>No gear, mods, or crew. Buy equipment at the market.</p>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  dim: {
    fontSize: 10,
    color: 'var(--ck-dim)',
    marginTop: 4,
  },
  sectionHead: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
    marginBottom: 6,
  },
  charCard: {
    padding: '10px 12px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    marginBottom: 10,
  },
  charHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  charName: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 12,
    color: 'var(--ck-val)',
    letterSpacing: '.04em',
  },
  skillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    padding: '2px 6px',
    borderRadius: 3,
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.06em',
    background: 'rgba(77,166,255,.12)',
    border: '1px solid rgba(77,166,255,.3)',
    color: 'var(--ck-accent)',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '5px 8px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
  },
  crewCard: {
    padding: '8px 10px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
  },
  badge: {
    fontSize: 8,
    color: 'var(--ck-dim)',
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.06em',
  },
};

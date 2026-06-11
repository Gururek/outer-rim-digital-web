import { useGameStore } from '../../../stores/gameStore';
import { CHARACTERS } from '@outer-rim/shared';
import type { ClientMessage, PlanningChoice } from '@outer-rim/shared';
import { MAP_NODES, getNodeById, getConnectedNodes, MARKET_CARDS } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

export default function NavigationTab({ onSend }: Props) {
  const phase = useGameStore(s => s.phase);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players = useGameStore(s => s.players);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const patrolNodes = useGameStore(s => s.patrolNodes);

  const myPlayer = players.get(mySessionId);
  if (!myPlayer) return <p style={styles.text}>Not connected.</p>;

  const currentNode = getNodeById(myPlayer.currentNodeId);
  const connected = currentNode ? getConnectedNodes(currentNode.id) : [];
  const isMyTurn = activePlayerId === mySessionId;

  const handlePlanningChoice = (choice: PlanningChoice) => {
    onSend({ type: 'PLANNING_CHOICE', payload: { choice } });
  };

  const handleMove = (destNodeId: number) => {
    onSend({ type: 'CONFIRM_MOVE', payload: { destinationNodeId: destNodeId } });
  };

  // Get character info for max health comparison
  const character = CHARACTERS.find(c => c.id === myPlayer.characterId);
  const maxHealth = character?.maxHealth ?? 8;
  const isDefeated = myPlayer.characterDamage >= maxHealth;

  // ─── PLANNING PHASE ──────────────────────────────────────────────────────────

  if (phase === 'PLANNING' && isMyTurn) {
    return (
      <div>
        <h3 style={styles.heading}>PLANNING PHASE</h3>
        <div style={styles.infoRow}>
          <span style={styles.label}>Location:</span>
          <span style={styles.value}>{currentNode?.name ?? 'Unknown'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Credits:</span>
          <span style={{ ...styles.value, color: '#ffd700' }}>{myPlayer.credits} cr</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Health:</span>
          <span style={{ ...styles.value, color: myPlayer.characterDamage > 0 ? '#ff8844' : '#00ff88' }}>
            {maxHealth - myPlayer.characterDamage} / {maxHealth}
          </span>
        </div>

        {isDefeated && (
          <div style={styles.defeatedBanner}>
            <p style={styles.defeatedText}>DEFEATED — Must RECOVER this turn</p>
          </div>
        )}

        <div style={styles.choices}>
          <button
            style={{ ...styles.btn, ...styles.moveBtn }}
            onClick={() => handlePlanningChoice('MOVE')}
            disabled={isDefeated}
          >
            🚀 MOVE
            <span style={styles.btnSubtext}>Travel on the galaxy map</span>
          </button>
          <button
            style={{ ...styles.btn, ...styles.recoverBtn }}
            onClick={() => handlePlanningChoice('RECOVER')}
          >
            🩹 RECOVER
            <span style={styles.btnSubtext}>Repair all hull &amp; health damage</span>
          </button>
          <button
            style={{ ...styles.btn, ...styles.creditsBtn }}
            onClick={() => handlePlanningChoice('GAIN_CREDITS')}
            disabled={isDefeated}
          >
            💰 GAIN +2000 cr
            <span style={styles.btnSubtext}>Skip actions to earn credits</span>
          </button>
        </div>

        {isDefeated && (
          <p style={styles.hint}>Defeated players cannot move or gain credits.</p>
        )}
      </div>
    );
  }

  // ─── ACTION PHASE ────────────────────────────────────────────────────────────

  if (phase === 'ACTION' && isMyTurn) {
    const actionsLeft = myPlayer.actionsRemaining;
    return (
      <div>
        <h3 style={styles.heading}>ACTION PHASE</h3>
        <div style={styles.infoRow}>
          <span style={styles.label}>Location:</span>
          <span style={styles.value}>{currentNode?.name ?? 'Unknown'}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.label}>Credits:</span>
          <span style={{ ...styles.value, color: '#ffd700' }}>{myPlayer.credits} cr</span>
        </div>
        <div style={styles.actCount}>
          ACTIONS REMAINING: {actionsLeft}
        </div>
        <p style={styles.subtext}>Buy/sell at market, deliver cargo, or interact with contacts.</p>

        {/* Connected nodes — only show MOVE if actions remain */}
        {actionsLeft > 0 && (
          <>
            <h4 style={styles.subheading}>Move to System</h4>
            <div style={styles.nodeList}>
              {connected.map(node => (
                <div key={node.id} style={styles.nodeItem}>
                  <div>
                    <span style={{ marginRight: '0.3rem' }}>
                      {node.type === 'PLANET' ? '🪐' : node.type === 'MAELSTROM' ? '🌀' : '✦'}
                    </span>
                    <span>{node.name}</span>
                    <span style={{ fontSize: '0.6rem', color: '#555', marginLeft: '0.3rem' }}>
                      ({node.factionOwner !== 'NONE' ? node.factionOwner : 'neutral'})
                    </span>
                  </div>
                  <button
                    style={styles.smallBtn}
                    onClick={() => handleMove(node.id)}
                  >
                    JUMP
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button
          style={{ ...styles.btn, marginTop: '0.75rem' }}
          onClick={() => onSend({ type: 'END_ACTION_PHASE' })}
        >
          ⏩ END ACTION PHASE
        </button>
      </div>
    );
  }

  // ─── ENCOUNTER PHASE ─────────────────────────────────────────────────────────

  if (phase === 'ENCOUNTER' && isMyTurn) {
    const hasPatrolHere = Object.values(patrolNodes).includes(myPlayer.currentNodeId);
    
    // Check if player has a job card matching current planet
    const currentPlanet = MAP_NODES.find(n => n.id === myPlayer.currentNodeId);
    const planetId = currentPlanet?.planetId ?? '';
    const hasJobHere = myPlayer.jobBountySlots.some(cardId => {
      const card = MARKET_CARDS.find(c => c.id === cardId);
      return card && card.deckType === 'JOB' && 'destinationPlanetId' in card && 
        (card as any).destinationPlanetId === planetId;
    });
    
    return (
      <div>
        <h3 style={styles.heading}>ENCOUNTER PHASE</h3>
        <div style={styles.infoRow}>
          <span style={styles.label}>Location:</span>
          <span style={styles.value}>{currentNode?.name ?? 'Unknown'}</span>
        </div>
        <p style={styles.subtext}>Choose your encounter action:</p>
        <div style={styles.choices}>
          {hasPatrolHere ? (
            <button
              style={{ ...styles.btn, ...styles.fightBtn }}
              onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'FIGHT_PATROL' } })}
            >
              ⚔️ FIGHT PATROL
              <span style={styles.btnSubtext}>Engage hostile patrol ships</span>
            </button>
          ) : (
            <div style={{ ...styles.btn, ...styles.fightBtn, ...styles.disabledBtn }}>
              ⚔️ FIGHT PATROL
              <span style={styles.btnSubtext}>No patrol at this location</span>
            </div>
          )}
          <button
            style={{ ...styles.btn, ...styles.encounterBtn }}
            onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'SPACE_ENCOUNTER' } })}
          >
            🎲 SPACE ENCOUNTER
            <span style={styles.btnSubtext}>Scan for salvage, anomalies, or distress signals</span>
          </button>
          {hasJobHere ? (
            <button
              style={{ ...styles.btn, ...styles.jobBtn }}
              onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'ATTEMPT_JOB' } })}
            >
              📋 ATTEMPT JOB
              <span style={styles.btnSubtext}>Complete a job at this planet</span>
            </button>
          ) : (
            <div style={{ ...styles.btn, ...styles.jobBtn, ...styles.disabledBtn }}>
              📋 ATTEMPT JOB
              <span style={styles.btnSubtext}>No job for this planet</span>
            </div>
          )}
          {myPlayer.jobBountySlots.some(cardId => {
            const card = MARKET_CARDS.find(c => c.id === cardId);
            return card && card.deckType === 'BOUNTY';
          }) ? (
            <button
              style={{ ...styles.btn, ...styles.bountyBtn }}
              onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'ATTEMPT_BOUNTY' } })}
            >
              💀 HUNT BOUNTY
              <span style={styles.btnSubtext}>Track down and engage a bounty target</span>
            </button>
          ) : (
            <div style={{ ...styles.btn, ...styles.bountyBtn, ...styles.disabledBtn }}>
              💀 HUNT BOUNTY
              <span style={styles.btnSubtext}>No active bounties</span>
            </div>
          )}
          <button
            style={{ ...styles.btn, ...styles.contactBtn }}
            onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'CONTACT' } })}
          >
            👤 CONTACT
            <span style={styles.btnSubtext}>Reveal a contact token</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── COMBAT / WIN_CHECK / OTHER ──────────────────────────────────────────────

  if (phase === 'COMBAT') {
    return (
      <div>
        <h3 style={styles.heading}>COMBAT</h3>
        <p style={styles.text}>Battle in progress...</p>
        <p style={styles.subtext}>Check the cinematic overlay for results.</p>
      </div>
    );
  }

  if (phase === 'WIN_CHECK') {
    return (
      <div>
        <h3 style={styles.heading}>CHECKING FAME</h3>
        <p style={styles.text}>Your Fame: {myPlayer.fame}</p>
        <p style={styles.subtext}>Advancing to next turn...</p>
      </div>
    );
  }

  // ─── DEFAULT — not my turn or waiting ────────────────────────────────────────

  const activePlayer = players.get(activePlayerId);
  return (
    <div>
      <h3 style={styles.heading}>NAVIGATION</h3>
      <div style={styles.infoRow}>
        <span style={styles.label}>Location:</span>
        <span style={styles.value}>{currentNode?.name ?? 'Unknown'}</span>
      </div>
      <p style={styles.subtext}>
        {activePlayer
          ? `Waiting for ${activePlayer.displayName}'s ${phase.replace(/_/g, ' ')}...`
          : `Waiting for ${phase.replace(/_/g, ' ')}...`
        }
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: '0.85rem',
    color: '#ffd700',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  subheading: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.2rem',
  },
  label: {
    fontSize: '0.7rem',
    color: '#666',
  },
  value: {
    fontSize: '0.75rem',
    color: '#ccc',
  },
  text: {
    fontSize: '0.8rem',
    color: '#ccc',
    marginBottom: '0.25rem',
  },
  subtext: {
    fontSize: '0.7rem',
    color: '#888',
    marginBottom: '0.75rem',
  },
  hint: {
    fontSize: '0.65rem',
    color: '#666',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  actCount: {
    fontSize: '0.8rem',
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  defeatedBanner: {
    background: 'rgba(255, 68, 68, 0.15)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '4px',
    padding: '0.4rem 0.6rem',
    marginBottom: '0.75rem',
    textAlign: 'center' as const,
  },
  defeatedText: {
    color: '#ff6666',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    margin: 0,
  },
  choices: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  btn: {
    padding: '0.6rem',
    background: 'rgba(0, 255, 136, 0.1)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '4px',
    color: '#00ff88',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: "'Courier New', monospace",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    transition: 'background 0.2s',
  },
  moveBtn: {
    borderColor: 'rgba(0, 200, 255, 0.3)',
    color: '#00ccff',
    background: 'rgba(0, 200, 255, 0.08)',
  },
  recoverBtn: {
    borderColor: 'rgba(255, 136, 68, 0.3)',
    color: '#ff8844',
    background: 'rgba(255, 136, 68, 0.08)',
  },
  creditsBtn: {
    borderColor: 'rgba(255, 215, 0, 0.3)',
    color: '#ffd700',
    background: 'rgba(255, 215, 0, 0.08)',
  },
  fightBtn: {
    borderColor: 'rgba(255, 68, 68, 0.3)',
    color: '#ff4444',
    background: 'rgba(255, 68, 68, 0.08)',
  },
  disabledBtn: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  encounterBtn: {
    borderColor: 'rgba(100, 100, 255, 0.3)',
    color: '#8888ff',
    background: 'rgba(100, 100, 255, 0.08)',
  },
  jobBtn: {
    borderColor: 'rgba(0, 255, 200, 0.3)',
    color: '#00ffcc',
    background: 'rgba(0, 255, 200, 0.08)',
  },
  bountyBtn: {
    borderColor: 'rgba(255, 100, 50, 0.3)',
    color: '#ff6432',
    background: 'rgba(255, 100, 50, 0.08)',
  },
  contactBtn: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#cccccc',
    background: 'rgba(255, 255, 255, 0.06)',
  },
  btnSubtext: {
    fontSize: '0.6rem',
    opacity: 0.6,
    marginTop: '0.15rem',
  },
  smallBtn: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(0, 200, 255, 0.1)',
    border: '1px solid rgba(0, 200, 255, 0.3)',
    borderRadius: '3px',
    color: '#00ccff',
    cursor: 'pointer',
    fontSize: '0.6rem',
    fontFamily: "'Courier New', monospace",
  },
  nodeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  nodeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.3rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '0.75rem',
    color: '#aaa',
  },
};

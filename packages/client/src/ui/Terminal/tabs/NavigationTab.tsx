import { useGameStore } from '../../../stores/gameStore';
import type { ClientMessage, PlanningChoice } from '@outer-rim/shared';
import { MAP_NODES, getNodeById, getConnectedNodes, findPath } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

export default function NavigationTab({ onSend }: Props) {
  const phase = useGameStore(s => s.phase);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players = useGameStore(s => s.players);
  const activePlayerId = useGameStore(s => s.activePlayerId);

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

  if (phase === 'PLANNING' && isMyTurn) {
    return (
      <div>
        <h3 style={styles.heading}>PLANNING PHASE</h3>
        <p style={styles.text}>Location: {currentNode?.name ?? 'Unknown'}</p>
        <div style={styles.choices}>
          <button style={styles.btn} onClick={() => handlePlanningChoice('MOVE')}>
            🚀 MOVE
          </button>
          <button style={styles.btn} onClick={() => handlePlanningChoice('RECOVER')}>
            🩹 RECOVER
          </button>
          <button style={styles.btn} onClick={() => handlePlanningChoice('GAIN_CREDITS')}>
            💰 GAIN +2000cr
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'ACTION' && isMyTurn) {
    const actionsLeft = myPlayer.actionsRemaining;
    return (
      <div>
        <h3 style={styles.heading}>ACTION PHASE</h3>
        <p style={styles.text}>Location: {currentNode?.name ?? 'Unknown'}</p>
        <p style={styles.actCount}>ACTIONS LEFT: {actionsLeft}</p>
        <p style={styles.subtext}>You may: buy/sell at market, deliver cargo, interact with contacts.</p>
        <button style={styles.btn} onClick={() => onSend({ type: 'END_ACTION_PHASE' })}>
          END ACTION
        </button>

        {/* Connected nodes — only show MOVE if actions remain */}
        {actionsLeft > 0 && (
          <>
            <h4 style={styles.subheading}>Reachable Systems</h4>
            <div style={styles.nodeList}>
              {connected.map(node => (
                <div key={node.id} style={styles.nodeItem}>
                  <span>{node.type === 'PLANET' ? '🪐' : '✦'} {node.name}</span>
                  <button
                    style={styles.smallBtn}
                    onClick={() => handleMove(node.id)}
                  >
                    MOVE
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (phase === 'ENCOUNTER' && isMyTurn) {
    return (
      <div>
        <h3 style={styles.heading}>ENCOUNTER PHASE</h3>
        <p style={styles.text}>Location: {currentNode?.name ?? 'Unknown'}</p>
        <div style={styles.choices}>
          <button
            style={styles.btn}
            onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'FIGHT_PATROL' } })}
          >
            ⚔️ FIGHT PATROL
          </button>
          <button
            style={styles.btn}
            onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'SPACE_ENCOUNTER' } })}
          >
            🎲 SPACE ENCOUNTER
          </button>
          <button
            style={styles.btn}
            onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: 'CONTACT' } })}
          >
            👤 CONTACT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={styles.heading}>NAVIGATION</h3>
      <p style={styles.text}>Location: {currentNode?.name ?? 'Unknown'}</p>
      <p style={styles.subtext}>Waiting for {phase.replace(/_/g, ' ')}...</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: '0.85rem',
    color: '#ffd700',
    marginBottom: '0.5rem',
  },
  subheading: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '1rem',
    marginBottom: '0.5rem',
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
  actCount: {
    fontSize: '0.8rem',
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
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
  },
  smallBtn: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '3px',
    color: '#999',
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

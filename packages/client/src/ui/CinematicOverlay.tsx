import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getNodeById } from '@outer-rim/shared';

interface CinematicProps {
  onDismiss: () => void;
}

export default function CinematicOverlay({ onDismiss }: CinematicProps) {
  const cinematic = useGameStore(s => s.cinematic);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!cinematic.active) {
      setVisible(false);
      return;
    }

    const message = formatEvent(cinematic.type, cinematic.payload);
    setText(message);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400); // after fade-out
    }, 3500);

    return () => clearTimeout(timer);
  }, [cinematic.active, cinematic.type, cinematic.payload, onDismiss]);

  if (!visible) return null;

  return (
    <div style={styles.backdrop} onClick={onDismiss}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <div style={styles.borderTop} />
        <div style={styles.content}>
          <div style={styles.icon}>{EVENT_ICONS[cinematic.type] ?? '◆'}</div>
          <h1 style={styles.title}>{EVENT_TITLES[cinematic.type] ?? cinematic.type}</h1>
          <p style={styles.text}>{text}</p>
          <p style={styles.hint}>Click anywhere to dismiss</p>
        </div>
        <div style={styles.borderBottom} />
      </div>
    </div>
  );
}

function formatEvent(type: string, payload: Record<string, unknown>): string {
  const store = useGameStore.getState();
  switch (type) {
    case 'CARD_PURCHASED': {
      const sessionId = String(payload.sessionId ?? '');
      const cardId = Number(payload.cardId ?? 0);
      return `${sessionId.slice(0, 6)} acquired card #${cardId}`;
    }
    case 'SHOW_MOVEMENT': {
      const startId = Number(payload.startNodeId ?? -1);
      const startNode = getNodeById(startId);
      return `Plotting course from ${startNode?.name ?? 'Unknown'}...`;
    }
    case 'FORCED_PATROL': {
      const faction = String(payload.faction ?? '');
      return `A ${faction} patrol has intercepted you! Prepare for combat.`;
    }
    case 'COMBAT_RESULT': {
      const winner = String(payload.winnerId ?? '');
      const attDmg = Number(payload.attackerDmg ?? 0);
      const defDmg = Number(payload.defenderDmg ?? 0);
      if (winner === store.mySessionId) return `Victory! Enemy took ${defDmg} damage. You received ${attDmg}.`;
      if (winner === 'patrol') return `Defeat! Patrol dealt ${attDmg} damage.`;
      return `Combat resolved. ${attDmg} vs ${defDmg} damage.`;
    }
    case 'ENCOUNTER_RESULT': {
      const desc = String(payload.description ?? '');
      return desc || 'Encounter resolved.';
    }
    case 'SPACE_ENCOUNTER': {
      const nodeId = Number(payload.nodeId ?? -1);
      const node = getNodeById(nodeId);
      return node ? `Anomaly detected near ${node.name}. Scanning for salvage...` : 'Space anomaly detected. Scanning...';
    }
    case 'HYPERSPACE_TRAVEL': {
      const path = payload.path as number[] | undefined;
      const count = path?.length ?? 0;
      return count > 0 ? `Jumping through ${count} system(s)...` : 'Entering hyperspace...';
    }
    case 'CONTACT_REVEALED': {
      const contactId = Number(payload.contactId ?? 0);
      return `Making contact with Mysterious Stranger #${contactId}...`;
    }
    default:
      return JSON.stringify(payload).slice(0, 120);
  }
}

const EVENT_TITLES: Record<string, string> = {
  CARD_PURCHASED: 'ACQUISITION',
  SHOW_MOVEMENT: 'HYPERSPACE JUMP',
  FORCED_PATROL: 'PATROL INTERCEPT',
  COMBAT_RESULT: 'COMBAT REPORT',
  ENCOUNTER_RESULT: 'ENCOUNTER',
  SPACE_ENCOUNTER: 'SPACE ANOMALY',
  HYPERSPACE_TRAVEL: 'HYPERSPACE JUMP',
  CONTACT_REVEALED: 'FIRST CONTACT',
  LEVEL4_PATROL: 'IMPOSSIBLE ODDS',
};

const EVENT_ICONS: Record<string, string> = {
  CARD_PURCHASED: '📦',
  SHOW_MOVEMENT: '🚀',
  FORCED_PATROL: '⚠️',
  COMBAT_RESULT: '⚔️',
  SPACE_ENCOUNTER: '🌌',
  HYPERSPACE_TRAVEL: '⏱',
  CONTACT_REVEALED: '👤',
  LEVEL4_PATROL: '💀',
};

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    animation: 'fadeIn 0.3s ease-out',
    cursor: 'pointer',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(10, 10, 30, 0.95), rgba(5, 5, 20, 0.98))',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '12px',
    minWidth: '400px',
    maxWidth: '500px',
    padding: '0',
    boxShadow: '0 0 60px rgba(255, 215, 0, 0.1), 0 0 120px rgba(0, 100, 255, 0.05)',
    animation: 'slideIn 0.4s ease-out',
    cursor: 'default',
    fontFamily: "'Courier New', monospace",
  },
  borderTop: {
    height: '3px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
    borderRadius: '12px 12px 0 0',
  },
  borderBottom: {
    height: '3px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent)',
    borderRadius: '0 0 12px 12px',
  },
  content: {
    padding: '2rem 2.5rem',
    textAlign: 'center',
  },
  icon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '1.1rem',
    color: '#ffd700',
    letterSpacing: '0.15em',
    marginBottom: '1rem',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  text: {
    fontSize: '0.85rem',
    color: '#cccccc',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  hint: {
    fontSize: '0.6rem',
    color: '#555',
    letterSpacing: '0.1em',
  },
};

import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getNodeById, getDatabankCard, getCardById } from '@outer-rim/shared';

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
      const outcome = String(payload.outcome ?? '');
      if (outcome) return outcome;
      const nodeId = Number(payload.nodeId ?? -1);
      const node = getNodeById(nodeId);
      return node ? `Anomaly detected near ${node.name}. Scanning for salvage...` : 'Space anomaly detected. Scanning...';
    }
    case 'NO_CONTACTS': {
      const nodeName = String(payload.nodeName ?? 'here');
      return `No contacts available at ${nodeName}. You drift on.`;
    }
    case 'SHIP_DESTROYED': {
      return `Your ship has been destroyed! You drift helplessly through space until rescued...`;
    }
    case 'HYPERSPACE_TRAVEL': {
      const path = payload.path as number[] | undefined;
      const count = path?.length ?? 0;
      return count > 0 ? `Jumping through ${count} system(s)...` : 'Entering hyperspace...';
    }
    case 'CONTACT_REVEALED': {
      const contactId = Number(payload.contactId ?? 0);
      const dbCard = getDatabankCard(contactId);
      if (dbCard) return `You've made contact with ${dbCard.name}\n"${dbCard.description}"`;
      return `Making contact with Mysterious Stranger #${contactId}...`;
    }
    case 'CARGO_DELIVERED': {
      const cardName = String(payload.cardName ?? 'cargo');
      const reward = Number(payload.reward ?? 0);
      return `Cargo delivered! ${cardName} — earned ${reward} credits.`;
    }
    case 'JOB_RESULT': {
      const jobName = String(payload.jobName ?? 'Job');
      const outcome = String(payload.outcome ?? '');
      const reward = payload.reward as { credits: number; fame: number } | undefined;
      const skillResults = payload.skillResults as Array<{ skill: string; passed: boolean }> | undefined;
      let msg = `Job: ${jobName}\n`;
      if (outcome === 'SUCCESS') {
        msg += `✅ SUCCESS! +${reward?.credits ?? 0}cr +${reward?.fame ?? 0} fame`;
      } else if (outcome === 'PARTIAL') {
        msg += `⚠️ PARTIAL SUCCESS. +${Math.floor((reward?.credits ?? 0) / 2)}cr +${Math.floor((reward?.fame ?? 0) / 2)} fame`;
      } else {
        msg += `❌ FAILED. The job went wrong.`;
      }
      if (skillResults) {
        msg += '\nSkills: ' + skillResults.map(r => `${r.skill} ${r.passed ? '✓' : '✗'}`).join(', ');
      }
      return msg;
    }
    case 'NO_JOB_HERE': {
      const nodeName = String(payload.nodeName ?? 'here');
      return `No outstanding jobs at ${nodeName}. Check your active contracts.`;
    }
    case 'BOUNTY_RESULT': {
      const bountyName = String(payload.bountyName ?? 'Bounty');
      const outcome = String(payload.outcome ?? '');
      const playerRoll = payload.playerRoll as { totalDamage: number } | undefined;
      const bountyRoll = payload.bountyRoll as { totalDamage: number } | undefined;
      if (outcome === 'ELIMINATED') {
        return `Bounty: ${bountyName}\n✅ ELIMINATED! (You: ${playerRoll?.totalDamage ?? 0} dmg vs Target: ${bountyRoll?.totalDamage ?? 0} dmg)`;
      }
      return `Bounty: ${bountyName}\n❌ FAILED! The target escaped. (You: ${playerRoll?.totalDamage ?? 0} dmg vs Target: ${bountyRoll?.totalDamage ?? 0} dmg)`;
    }
    case 'NO_BOUNTIES': {
      return `No active bounty contracts. Visit the market to pick up a bounty puck.`;
    }
    case 'CARD_PURCHASED': {
      const sessionId = String(payload.sessionId ?? '');
      const cardId = Number(payload.cardId ?? 0);
      const card = getCardById(cardId);
      const cardName = card ? card.name : `Card #${cardId}`;
      const player = store.players.get(sessionId);
      const who = player ? player.displayName : sessionId.slice(0, 6);
      return `${who} acquired ${cardName}`;
    }
    case 'DICE_ROLLED': {
      const rolls = payload.rolls as Array<{ faces: string[]; totalDamage: number }> | undefined;
      if (!rolls || rolls.length < 2) return 'Dice rolled.';
      const playerRoll = rolls[0];
      const patrolRoll = rolls[1];
      const playerFaces = playerRoll.faces.map(f => FACE_ICONS[f] ?? f).join(' ');
      const patrolFaces = patrolRoll.faces.map(f => FACE_ICONS[f] ?? f).join(' ');
      return `Your roll: [${playerFaces}] = ${playerRoll.totalDamage} dmg\nPatrol roll: [${patrolFaces}] = ${patrolRoll.totalDamage} dmg`;
    }
    case 'ENCOUNTER_CARD': {
      const cardId = Number(payload.cardId ?? 0);
      const planetId = String(payload.planetId ?? '');
      const node = getNodeById(Number(planetId)) || { name: planetId };
      return `Encounter card #${cardId} drawn near ${node.name ?? planetId}.`;
    }
    case 'LEVEL4_PATROL': {
      const faction = String(payload.faction ?? '');
      return `A massive ${faction} fleet blockades the system! Impossible odds — your ship is crippled.`;
    }
    default:
      return JSON.stringify(payload).slice(0, 120);
  }
}

const FACE_ICONS: Record<string, string> = {
  HIT: '⚡',
  CRIT: '💥',
  FOCUS: '◎',
  BLANK: '○',
};

const EVENT_TITLES: Record<string, string> = {
  CARD_PURCHASED: 'ACQUISITION',
  SHOW_MOVEMENT: 'HYPERSPACE JUMP',
  FORCED_PATROL: 'PATROL INTERCEPT',
  COMBAT_RESULT: 'COMBAT REPORT',
  DICE_ROLLED: 'DICE ROLL',
  ENCOUNTER_RESULT: 'ENCOUNTER',
  ENCOUNTER_CARD: 'ENCOUNTER',
  SPACE_ENCOUNTER: 'SPACE ANOMALY',
  SHIP_DESTROYED: 'SHIP LOST',
  NO_CONTACTS: 'NO CONTACTS',
  HYPERSPACE_TRAVEL: 'HYPERSPACE JUMP',
  CONTACT_REVEALED: 'FIRST CONTACT',
  LEVEL4_PATROL: 'IMPOSSIBLE ODDS',
  JOB_RESULT: 'JOB COMPLETE',
  NO_JOB_HERE: 'NO JOBS',
  CARGO_DELIVERED: 'DELIVERY COMPLETE',
  BOUNTY_RESULT: 'BOUNTY HUNT',
  NO_BOUNTIES: 'NO BOUNTIES',
};
const EVENT_ICONS: Record<string, string> = {
  CARD_PURCHASED: '📦',
  SHOW_MOVEMENT: '🚀',
  FORCED_PATROL: '⚠️',
  COMBAT_RESULT: '⚔️',
  DICE_ROLLED: '🎲',
  ENCOUNTER_CARD: '🃏',
  SPACE_ENCOUNTER: '🌌',
  SHIP_DESTROYED: '💥',
  NO_CONTACTS: '🫥',
  HYPERSPACE_TRAVEL: '⏱',
  CONTACT_REVEALED: '👤',
  LEVEL4_PATROL: '💀',
  JOB_RESULT: '📋',
  NO_JOB_HERE: '📭',
  CARGO_DELIVERED: '📦',
  BOUNTY_RESULT: '💀',
  NO_BOUNTIES: '🔍',
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

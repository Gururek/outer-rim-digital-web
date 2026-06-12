import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { getNodeById, getDatabankCard, getCardById } from '@outer-rim/shared';

interface Props {
  onDismiss: () => void;
}

export default function CinematicOverlay({ onDismiss }: Props) {
  const cinematic = useGameStore(s => s.cinematic);
  const [visible, setVisible] = useState(false);
  const [text,    setText]    = useState('');

  useEffect(() => {
    // CONTACT_REVEALED is handled by ContactRevealOverlay
    if (!cinematic.active || cinematic.type === 'CONTACT_REVEALED') { setVisible(false); return; }
    setText(formatEvent(cinematic.type, cinematic.payload));
    setVisible(true);

    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 350); }, 3800);
    return () => clearTimeout(t);
  }, [cinematic.active, cinematic.type, cinematic.payload, onDismiss]);

  if (!visible) return null;

  const icon  = ICONS[cinematic.type]  ?? '◆';
  const title = TITLES[cinematic.type] ?? cinematic.type.replace(/_/g, ' ');
  const color = COLORS[cinematic.type] ?? 'var(--ck-accent)';

  return (
    <div style={S.backdrop} onClick={onDismiss}>
      <div style={S.card} onClick={e => e.stopPropagation()}>
        <div style={{ ...S.topBar,   background: color }} />
        <div style={S.body}>
          <div style={{ fontSize: '2rem', marginBottom: '.6rem' }}>{icon}</div>
          <div style={{ ...S.title, color }}>{title}</div>
          <p style={S.text}>{text}</p>
          <div style={{ ...S.hint, borderTop: `1px solid ${color}22` }}>
            CLICK TO DISMISS
          </div>
        </div>
        <div style={{ ...S.topBar, background: color }} />
      </div>
    </div>
  );
}

function formatEvent(type: string, payload: Record<string, unknown>): string {
  const store = useGameStore.getState();
  switch (type) {
    case 'SHOW_MOVEMENT': {
      const node = getNodeById(Number(payload.startNodeId ?? -1));
      return `Plotting course from ${node?.name ?? 'current position'}. Select destination.`;
    }
    case 'FORCED_PATROL':
      return `A ${payload.faction} patrol has intercepted your vessel. Prepare for combat.`;
    case 'HYPERSPACE_TRAVEL': {
      const hops = (payload.path as number[] | undefined)?.length ?? 0;
      return hops > 0 ? `Jumping through ${hops} system(s)...` : 'Entering hyperspace.';
    }
    case 'SPACE_ENCOUNTER':
      return String(payload.outcome ?? 'Anomaly detected. Scanning sector...');
    case 'NO_CONTACTS': {
      const nodeName = String(payload.nodeName ?? 'this location');
      return `No contacts available at ${nodeName}.`;
    }
    case 'SHIP_DESTROYED':
      return 'Your vessel has been destroyed. You drift until rescued. Credits lost.';
    case 'CONTACT_REVEALED': {
      const db = getDatabankCard(Number(payload.contactId ?? 0));
      return db ? `Contact: ${db.name}\n"${db.description}"` : 'Mysterious contact encountered.';
    }
    case 'COMBAT_RESULT': {
      const myId   = store.mySessionId;
      const winner = String(payload.winnerId ?? '');
      const attDmg = Number(payload.attackerDmg ?? 0);
      const defDmg = Number(payload.defenderDmg ?? 0);
      if (winner === myId) return `Victory! You dealt ${defDmg} damage. Took ${attDmg}.`;
      if (winner === 'patrol') return `Defeat! Patrol dealt ${attDmg} damage.`;
      return `Combat: ${attDmg} vs ${defDmg} damage.`;
    }
    case 'LEVEL4_PATROL':
      return `A ${payload.faction} battle fleet blockades the sector. Impossible odds — ship crippled.`;
    case 'CARD_PURCHASED': {
      const card   = getCardById(Number(payload.cardId ?? 0));
      const player = store.players.get(String(payload.sessionId ?? ''));
      const who    = player?.displayName ?? 'Someone';
      return `${who} acquired ${card?.name ?? 'a card'}.`;
    }
    case 'CARGO_DELIVERED':
      return `Delivery complete: ${payload.cardName}. +${Number(payload.reward ?? 0).toLocaleString()} credits.`;
    case 'JOB_RESULT': {
      const outcome = String(payload.outcome ?? '');
      const r = payload.reward as { credits: number; fame: number } | undefined;
      const skills = (payload.skillResults as Array<{ skill: string; passed: boolean }> | undefined)
        ?.map(s => `${s.skill}${s.passed ? '✓' : '✗'}`).join(' ');
      if (outcome === 'SUCCESS')
        return `${payload.jobName}: SUCCESS — +${r?.credits ?? 0}cr +${r?.fame ?? 0} fame\n${skills ?? ''}`;
      if (outcome === 'PARTIAL')
        return `${payload.jobName}: PARTIAL — +${Math.floor((r?.credits ?? 0) / 2)}cr +${Math.floor((r?.fame ?? 0) / 2)} fame\n${skills ?? ''}`;
      return `${payload.jobName}: FAILED. ${skills ?? ''}`;
    }
    case 'NO_JOB_HERE':
      return `No outstanding jobs at ${payload.nodeName ?? 'this planet'}. Check your contracts.`;
    case 'BOUNTY_RESULT': {
      const outcome   = String(payload.outcome ?? '');
      const pRoll     = payload.playerRoll as { totalDamage: number } | undefined;
      const bRoll     = payload.bountyRoll as { totalDamage: number } | undefined;
      const result    = outcome === 'ELIMINATED' ? 'ELIMINATED' : 'ESCAPED';
      return `${payload.bountyName}: ${result} (${pRoll?.totalDamage ?? 0} vs ${bRoll?.totalDamage ?? 0} dmg)`;
    }
    case 'NO_BOUNTIES':
      return 'No active bounty contracts. Visit the market to pick up a bounty puck.';
    case 'DICE_ROLLED': {
      const rolls = payload.rolls as Array<{ faces: string[]; totalDamage: number }> | undefined;
      if (!rolls || rolls.length < 2) return 'Dice rolled.';
      const f = (roll: typeof rolls[0]) =>
        roll.faces.map(f => ({ HIT: '⚡', CRIT: '💥', FOCUS: '◎', BLANK: '○' }[f] ?? f)).join(' ');
      return `Your roll: [${f(rolls[0])}] = ${rolls[0].totalDamage}\nPatrol: [${f(rolls[1])}] = ${rolls[1].totalDamage}`;
    }
    default:
      return JSON.stringify(payload).slice(0, 120);
  }
}

const ICONS: Record<string, string> = {
  SHOW_MOVEMENT:    '🚀',
  FORCED_PATROL:    '⚠️',
  HYPERSPACE_TRAVEL:'⏱',
  SPACE_ENCOUNTER:  '🌌',
  NO_CONTACTS:      '🫥',
  SHIP_DESTROYED:   '💥',
  CONTACT_REVEALED: '👤',
  COMBAT_RESULT:    '⚔️',
  LEVEL4_PATROL:    '💀',
  CARD_PURCHASED:   '📦',
  CARGO_DELIVERED:  '📦',
  JOB_RESULT:       '📋',
  NO_JOB_HERE:      '📭',
  BOUNTY_RESULT:    '💀',
  NO_BOUNTIES:      '🔍',
  DICE_ROLLED:      '🎲',
};

const TITLES: Record<string, string> = {
  SHOW_MOVEMENT:    'HYPERSPACE JUMP',
  FORCED_PATROL:    'PATROL INTERCEPT',
  HYPERSPACE_TRAVEL:'HYPERSPACE JUMP',
  SPACE_ENCOUNTER:  'SPACE ANOMALY',
  NO_CONTACTS:      'NO CONTACTS',
  SHIP_DESTROYED:   'SHIP LOST',
  CONTACT_REVEALED: 'FIRST CONTACT',
  COMBAT_RESULT:    'COMBAT REPORT',
  LEVEL4_PATROL:    'IMPOSSIBLE ODDS',
  CARD_PURCHASED:   'ACQUISITION',
  CARGO_DELIVERED:  'DELIVERY COMPLETE',
  JOB_RESULT:       'JOB COMPLETE',
  NO_JOB_HERE:      'NO JOBS HERE',
  BOUNTY_RESULT:    'BOUNTY HUNT',
  NO_BOUNTIES:      'NO CONTRACTS',
  DICE_ROLLED:      'DICE ROLL',
};

const COLORS: Record<string, string> = {
  FORCED_PATROL:    'var(--ck-red)',
  SHIP_DESTROYED:   'var(--ck-red)',
  LEVEL4_PATROL:    'var(--ck-red)',
  BOUNTY_RESULT:    'var(--ck-gold)',
  JOB_RESULT:       'var(--ck-gold)',
  CARGO_DELIVERED:  'var(--ck-green)',
  CONTACT_REVEALED: 'var(--ck-green)',
  CARD_PURCHASED:   'var(--ck-green)',
  COMBAT_RESULT:    'var(--ck-gold)',
};

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(6,13,24,.75)',
    cursor: 'pointer',
    fontFamily: "'Share Tech Mono', monospace",
  },
  card: {
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    minWidth: 360,
    maxWidth: 480,
    overflow: 'hidden',
    cursor: 'default',
    animation: 'ck-fade .35s ease',
  },
  topBar: {
    height: 3,
    opacity: .8,
  },
  body: {
    padding: '1.75rem 2rem',
    textAlign: 'center',
  },
  title: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: '1rem',
    letterSpacing: '.15em',
    marginBottom: '.75rem',
  },
  text: {
    fontSize: '.85rem',
    color: 'var(--ck-val)',
    lineHeight: 1.55,
    whiteSpace: 'pre-line',
    marginBottom: '1.25rem',
  },
  hint: {
    paddingTop: '.75rem',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
  },
};

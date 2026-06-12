import { useState } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import { CHARACTERS, MAP_NODES, getNodeById, getConnectedNodes } from '@outer-rim/shared';
import type { ClientMessage, PlanningChoice } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

export default function NavigationTab({ onSend }: Props) {
  const [selectedChoice, setSelectedChoice] = useState<PlanningChoice | null>(null);
  const phase          = useGameStore(s => s.phase);
  const myId           = useGameStore(s => s.mySessionId);
  const activeId       = useGameStore(s => s.activePlayerId);
  const players        = useGameStore(s => s.players);
  const patrolNodes    = useGameStore(s => s.patrolNodes);

  const me = players.get(myId);
  if (!me) return <p style={S.dim}>Not connected.</p>;

  const isMyTurn    = activeId === myId;
  const currentNode = getNodeById(me.currentNodeId);
  const connected   = currentNode ? getConnectedNodes(currentNode.id) : [];
  const char        = CHARACTERS.find(c => c.id === me.characterId);
  const maxHealth   = char?.maxHealth ?? 8;
  const isDefeated  = me.characterDamage >= maxHealth;

  // ── PLANNING ────────────────────────────────────────────────────────────────

  if (phase === 'PLANNING' && isMyTurn) {
    const choices: { id: PlanningChoice; label: string; desc: string; disabled?: boolean }[] = [
      { id: 'MOVE',          label: 'SET COURSE',    desc: 'Move up to your hyperdrive range', disabled: isDefeated },
      { id: 'RECOVER',       label: 'REST & REPAIR', desc: 'Recover all hull and health damage' },
      { id: 'GAIN_CREDITS',  label: 'ODD JOBS',      desc: 'Gain 2,000 credits instead of acting', disabled: isDefeated },
    ];

    const handleConfirm = () => {
      if (!selectedChoice) return;
      onSend({ type: 'PLANNING_CHOICE', payload: { choice: selectedChoice } });
      setSelectedChoice(null);
    };

    return (
      <div>
        <div className="ck-label" style={{ marginBottom: 10 }}>CHOOSE ACTION — PLANNING PHASE</div>

        {isDefeated && (
          <div style={S.defeatedBanner}>DEFEATED — MUST RECOVER THIS TURN</div>
        )}

        <div style={{ display: 'grid', gap: 7 }}>
          {choices.map(c => {
            const sel = selectedChoice === c.id;
            return (
              <button
                key={c.id}
                style={{
                  ...S.choiceBtn,
                  ...(sel ? S.choiceSel : {}),
                  ...(c.disabled ? S.choiceDisabled : {}),
                }}
                onClick={() => !c.disabled && setSelectedChoice(sel ? null : c.id)}
                disabled={c.disabled}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Orbitron',sans-serif",
                    fontSize: 10,
                    color: sel ? 'var(--ck-accent)' : 'var(--ck-val)',
                    letterSpacing: '.06em',
                    marginBottom: 2,
                  }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--ck-dim)' }}>{c.desc}</div>
                </div>
                {sel && (
                  <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8, color: 'var(--ck-accent)', marginLeft: 4 }}>
                    SELECTED
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selectedChoice && (
          <button style={S.confirmBtn} onClick={handleConfirm}>
            CONFIRM AND PROCEED →
          </button>
        )}
      </div>
    );
  }

  // ── ACTION ──────────────────────────────────────────────────────────────────

  if (phase === 'ACTION' && isMyTurn) {
    return (
      <div>
        <div className="ck-label" style={{ marginBottom: 6 }}>ACTION PHASE</div>
        <div style={S.infoRow}>
          <span className="ck-label">LOCATION</span>
          <span style={S.val}>{currentNode?.name ?? '—'}</span>
        </div>
        <div style={S.infoRow}>
          <span className="ck-label">ACTIONS</span>
          <span style={{ ...S.val, color: me.actionsRemaining > 0 ? 'var(--ck-green)' : 'var(--ck-dim)' }}>
            {me.actionsRemaining} REMAINING
          </span>
        </div>

        {me.actionsRemaining > 0 && (
          <>
            <div className="ck-label" style={{ margin: '10px 0 6px' }}>JUMP TO SYSTEM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {connected.map(node => (
                <div key={node.id} style={S.nodeRow}>
                  <div style={{ flex: 1, fontSize: 11, color: 'var(--ck-val)' }}>
                    {node.type === 'PLANET' ? '◉' : node.type === 'MAELSTROM' ? '◌' : '◈'}{' '}
                    {node.name}
                    <span style={{ fontSize: 8, color: 'var(--ck-dim)', marginLeft: 6 }}>
                      {node.factionOwner !== 'NONE' ? node.factionOwner : 'NEUTRAL'}
                    </span>
                  </div>
                  <button style={S.jumpBtn}
                    onClick={() => onSend({ type: 'CONFIRM_MOVE', payload: { destinationNodeId: node.id } })}>
                    JUMP
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <button style={{ ...S.confirmBtn, marginTop: 10 }}
          onClick={() => onSend({ type: 'END_ACTION_PHASE' })}>
          END ACTION PHASE →
        </button>
      </div>
    );
  }

  // ── ENCOUNTER ───────────────────────────────────────────────────────────────

  if (phase === 'ENCOUNTER' && isMyTurn) {
    const hasPatrol = Object.values(patrolNodes).includes(me.currentNodeId);

    const actions = [
      { id: 'FIGHT_PATROL',    label: 'ENGAGE PATROL',  desc: 'Attack the hostile patrol', available: hasPatrol, danger: true },
      { id: 'SPACE_ENCOUNTER', label: 'SPACE ENCOUNTER', desc: 'Scan for anomalies and salvage', available: true, danger: false },
      { id: 'ATTEMPT_JOB',     label: 'COMPLETE JOB',   desc: 'Deliver your job at this planet', available: true, danger: false },
      { id: 'ATTEMPT_BOUNTY',  label: 'HUNT BOUNTY',    desc: 'Track down your bounty target', available: true, danger: false },
      { id: 'CONTACT',         label: 'MEET CONTACT',   desc: 'Reveal a contact token', available: true, danger: false },
    ] as const;

    return (
      <div>
        <div className="ck-label" style={{ marginBottom: 6 }}>ENCOUNTER PHASE</div>
        <div style={S.infoRow}>
          <span className="ck-label">LOCATION</span>
          <span style={S.val}>{currentNode?.name ?? '—'}</span>
        </div>
        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
          {actions.map(a => (
            <button
              key={a.id}
              style={{
                ...S.choiceBtn,
                ...(a.danger ? S.dangerChoice : {}),
                ...(!a.available ? S.choiceDisabled : {}),
              }}
              onClick={() => onSend({ type: 'SUBMIT_ENCOUNTER', payload: { choice: a.id as any } })}
              disabled={!a.available}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Orbitron',sans-serif",
                  fontSize: 10,
                  color: a.danger ? 'var(--ck-red)' : 'var(--ck-val)',
                  letterSpacing: '.06em',
                  marginBottom: 2,
                }}>{a.label}</div>
                <div style={{ fontSize: 10, color: 'var(--ck-dim)' }}>{a.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── COMBAT / WIN_CHECK ──────────────────────────────────────────────────────

  if (phase === 'COMBAT') {
    return (
      <div>
        <div className="ck-label" style={{ marginBottom: 8 }}>COMBAT IN PROGRESS</div>
        <p style={S.dim}>Watch the combat overlay for results.</p>
      </div>
    );
  }

  // ── WAITING / OTHER ─────────────────────────────────────────────────────────

  const activePlayer = players.get(activeId);
  return (
    <div>
      <div className="ck-label" style={{ marginBottom: 8 }}>NAVIGATION</div>
      <div style={S.infoRow}>
        <span className="ck-label">LOCATION</span>
        <span style={S.val}>{currentNode?.name ?? '—'}</span>
      </div>
      <p style={S.dim}>
        {activePlayer
          ? `${activePlayer.displayName.toUpperCase()} — ${phase.replace(/_/g, ' ')}`
          : 'WAITING FOR TURN'}
      </p>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  dim: {
    fontSize: 10,
    color: 'var(--ck-dim)',
    marginTop: 4,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  val: {
    fontSize: 11,
    color: 'var(--ck-val)',
    fontFamily: "'Share Tech Mono',monospace",
  },
  defeatedBanner: {
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 9,
    color: 'var(--ck-red)',
    border: '1px solid var(--ck-red)',
    borderRadius: 3,
    padding: '5px 10px',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: '.08em',
    background: 'rgba(224,85,85,.06)',
  },
  choiceBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'border-color .15s',
    fontFamily: "'Share Tech Mono',monospace",
  },
  choiceSel: {
    background: 'var(--ck-panel2)',
    borderColor: 'var(--ck-accent)',
  },
  choiceDisabled: {
    opacity: .35,
    cursor: 'not-allowed',
  },
  dangerChoice: {
    borderColor: 'rgba(224,85,85,.3)',
    background: 'rgba(224,85,85,.04)',
  },
  confirmBtn: {
    width: '100%',
    padding: 9,
    background: 'rgba(77,166,255,.1)',
    border: '1px solid var(--ck-accent)',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 9,
    color: 'var(--ck-accent)',
    letterSpacing: '.12em',
    marginTop: 10,
  },
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '5px 8px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
  },
  jumpBtn: {
    padding: '3px 8px',
    background: 'rgba(77,166,255,.12)',
    border: '1px solid rgba(77,166,255,.3)',
    borderRadius: 3,
    color: 'var(--ck-accent)',
    cursor: 'pointer',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    letterSpacing: '.08em',
  },
};

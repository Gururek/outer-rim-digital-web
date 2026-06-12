import { useGameStore } from '../../../stores/gameStore';
import type { ClientMessage, CargoCard } from '@outer-rim/shared';
import { MAP_NODES, getCardById } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

export default function CargoTab({ onSend }: Props) {
  const players  = useGameStore(s => s.players);
  const myId     = useGameStore(s => s.mySessionId);
  const activeId = useGameStore(s => s.activePlayerId);
  const phase    = useGameStore(s => s.phase);
  const me       = players.get(myId);

  if (!me) return <p style={S.dim}>Not connected.</p>;

  const canAct = phase === 'ACTION' && activeId === myId;

  // Resolve cargo card objects
  const cargoCards = me.cargoSlots
    .map((id, slotIdx) => {
      const card = getCardById(id) as CargoCard | undefined;
      return card ? { card, slotIdx } : null;
    })
    .filter((x): x is { card: CargoCard; slotIdx: number } => x !== null);

  const currentNode = MAP_NODES.find(n => n.id === me.currentNodeId);

  return (
    <div>
      <div style={S.sectionHead}>
        CARGO HOLD — {cargoCards.length} / {me.cargoSlots.length || 3} SLOTS
      </div>

      {cargoCards.length === 0 ? (
        <p style={S.dim}>Cargo hold is empty. Buy cargo at the market.</p>
      ) : (
        <div style={{ display: 'grid', gap: 7 }}>
          {cargoCards.map(({ card, slotIdx }) => {
            const destNode = MAP_NODES.find(n => n.planetId === card.destinationPlanetId);
            const atDest = currentNode?.planetId === card.destinationPlanetId;

            return (
              <div key={slotIdx} style={S.cargoRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: 'var(--ck-val)' }}>{card.name}</span>
                    {card.isIllegal && (
                      <span style={S.illegalBadge}>ILLEGAL</span>
                    )}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--ck-dim)' }}>
                    DEST:{' '}
                    <span style={{ color: atDest ? 'var(--ck-green)' : 'var(--ck-text)' }}>
                      {destNode?.name ?? card.destinationPlanetId.toUpperCase()}
                    </span>
                    &nbsp;|&nbsp;REWARD:{' '}
                    <span style={{ color: 'var(--ck-gold)' }}>
                      {(card.deliveryReward ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    ...S.deliverBtn,
                    color:        atDest ? 'var(--ck-green)' : 'var(--ck-dim)',
                    borderColor:  atDest ? 'var(--ck-green)' : 'var(--ck-border)',
                    opacity:      atDest && canAct ? 1 : .45,
                    cursor:       atDest && canAct ? 'pointer' : 'not-allowed',
                  }}
                  onClick={() => atDest && canAct && onSend({ type: 'DELIVER_CARGO', payload: { cardSlotIndex: slotIdx } })}
                  disabled={!atDest || !canAct}
                >
                  {atDest ? 'DELIVER' : 'TRANSIT'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Jobs / bounties */}
      {me.jobBountySlots.length > 0 && (
        <>
          <div style={{ ...S.sectionHead, marginTop: 14 }}>CONTRACTS</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {me.jobBountySlots.map((id, i) => {
              const card = getCardById(id);
              if (!card) return null;
              return (
                <div key={i} style={S.contractRow}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 10, color: 'var(--ck-val)' }}>{card.name}</span>
                    <span style={S.deckBadge}>{card.deckType}</span>
                  </div>
                  <span style={{ fontSize: 9, color: 'var(--ck-dim)' }}>
                    {'reward' in card ? `+${(card as any).reward?.credits ?? 0}cr` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </>
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
    marginBottom: 8,
  },
  cargoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
  },
  illegalBadge: {
    fontSize: 7,
    padding: '1px 5px',
    border: '1px solid rgba(224,85,85,.5)',
    color: 'var(--ck-red)',
    borderRadius: 2,
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.04em',
  },
  deliverBtn: {
    padding: '5px 10px',
    borderRadius: 3,
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    letterSpacing: '.08em',
    border: '1px solid',
    background: 'transparent',
    flexShrink: 0,
  },
  contractRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
  },
  deckBadge: {
    marginLeft: 8,
    fontSize: 8,
    color: 'var(--ck-dim)',
    fontFamily: "'Orbitron',sans-serif",
    letterSpacing: '.06em',
  },
};

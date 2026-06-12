import { useState } from 'react';
import { useGameStore } from '../../../stores/gameStore';
import type { ClientMessage, MarketDeckType } from '@outer-rim/shared';
import { MARKET_CARDS, MAP_NODES } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

const DECK_TYPES: MarketDeckType[] = ['BOUNTY', 'CARGO', 'GEAR_MOD', 'JOB', 'LUXURY', 'SHIP'];

const DECK_LABELS: Record<MarketDeckType, string> = {
  BOUNTY:   'BOUNTY',
  CARGO:    'CARGO',
  GEAR_MOD: 'GEAR·MOD',
  JOB:      'JOB',
  LUXURY:   'LUXURY',
  SHIP:     'SHIP',
};

export default function MarketTab({ onSend }: Props) {
  const [selected, setSelected] = useState<MarketDeckType | null>(null);

  const marketTopCards = useGameStore(s => s.marketTopCards);
  const phase          = useGameStore(s => s.phase);
  const myId           = useGameStore(s => s.mySessionId);
  const activeId       = useGameStore(s => s.activePlayerId);
  const players        = useGameStore(s => s.players);

  const me      = players.get(myId);
  const canAct  = phase === 'ACTION' && activeId === myId;

  return (
    <div>
      <div style={S.header}>
        <span className="ck-label">GALACTIC MARKET — TOP CARDS</span>
        <span style={{ fontSize: 8, color: 'var(--ck-dim)', fontFamily: "'Orbitron',sans-serif" }}>
          ◆ PLANET ONLY
        </span>
      </div>

      {/* 3×2 grid of deck cards */}
      <div style={S.grid}>
        {DECK_TYPES.map(deckType => {
          const cardId = marketTopCards[deckType] ?? -1;
          const card   = cardId > 0 ? MARKET_CARDS.find(c => c.id === cardId) : null;
          const isSel  = selected === deckType;

          return (
            <div
              key={deckType}
              style={{
                ...S.deckCard,
                ...(isSel ? S.deckCardSel : {}),
              }}
              onClick={() => setSelected(isSel ? null : deckType)}
              role="button"
            >
              <div style={S.deckCardHead}>
                <span className="ck-label" style={{ letterSpacing: '.06em' }}>{DECK_LABELS[deckType]}</span>
                {card && (
                  <span style={{ fontSize: 10, color: card.buyCost === 0 ? 'var(--ck-green)' : 'var(--ck-gold)' }}>
                    {card.buyCost === 0 ? 'FREE' : `${card.buyCost.toLocaleString()}`}
                  </span>
                )}
              </div>

              {card ? (
                <div style={{ fontSize: 10, color: 'var(--ck-val)', lineHeight: 1.3, marginTop: 2 }}>
                  {card.name}
                </div>
              ) : (
                <div style={{ fontSize: 9, color: 'var(--ck-dim)', fontStyle: 'italic' }}>— empty —</div>
              )}

              {/* Extra detail when selected */}
              {isSel && card && (
                <div style={{ marginTop: 4, fontSize: 9, color: 'var(--ck-text)', lineHeight: 1.4 }}>
                  {card.effectDescription}
                  {'destinationPlanetId' in card && (
                    <div style={{ color: 'var(--ck-accent)', marginTop: 2 }}>
                      → {MAP_NODES.find(n => n.planetId === (card as any).destinationPlanetId)?.name ?? 'Unknown'}
                    </div>
                  )}
                  {'hyperdriveBonus' in card && (card as any).hyperdriveBonus &&
                    <div style={{ color: 'var(--ck-accent)' }}>Hyperdrive +{(card as any).hyperdriveBonus}</div>}
                  {'hullBonus' in card && (card as any).hullBonus &&
                    <div style={{ color: 'var(--ck-accent)' }}>Hull +{(card as any).hullBonus}</div>}
                  {'attackDiceBonus' in card && (card as any).attackDiceBonus &&
                    <div style={{ color: 'var(--ck-accent)' }}>Combat +{(card as any).attackDiceBonus}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons when a deck is selected */}
      {selected && (
        <div style={S.actions}>
          <button
            style={S.cycleBtn}
            onClick={() => { onSend({ type: 'MARKET_DISCARD', payload: { deckType: selected } }); setSelected(null); }}
            disabled={!canAct}
            title={canAct ? 'Cycle card to bottom of deck' : 'Action phase only'}
          >
            CYCLE DECK
          </button>
          {(marketTopCards[selected] ?? -1) > 0 && (
            <button
              style={S.buyBtn}
              onClick={() => { onSend({ type: 'MARKET_BUY', payload: { deckType: selected } }); setSelected(null); }}
              disabled={!canAct || (me?.credits ?? 0) < (MARKET_CARDS.find(c => c.id === marketTopCards[selected])?.buyCost ?? 0)}
              title={!canAct ? 'Action phase only' : (me?.credits ?? 0) < (MARKET_CARDS.find(c => c.id === marketTopCards[selected])?.buyCost ?? 0) ? 'Not enough credits' : 'Purchase this card'}
            >
              BUY CARD
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 7,
  },
  deckCard: {
    padding: '9px 10px',
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'border-color .15s',
  },
  deckCardSel: {
    borderColor: 'var(--ck-gold)',
    background: 'var(--ck-panel2)',
  },
  deckCardHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actions: {
    display: 'flex',
    gap: 7,
    marginTop: 10,
  },
  cycleBtn: {
    flex: 1,
    padding: 8,
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.08em',
  },
  buyBtn: {
    flex: 1,
    padding: 8,
    background: 'rgba(245,160,32,.1)',
    border: '1px solid var(--ck-gold)',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 8,
    color: 'var(--ck-gold)',
    letterSpacing: '.08em',
  },
};

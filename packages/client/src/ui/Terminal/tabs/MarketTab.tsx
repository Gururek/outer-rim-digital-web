import { useGameStore } from '../../../stores/gameStore';
import type { ClientMessage, MarketDeckType } from '@outer-rim/shared';
import { MARKET_CARDS, MARKET_DECK_NAMES } from '@outer-rim/shared';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

const DECK_TYPES: MarketDeckType[] = ['BOUNTY', 'CARGO', 'GEAR_MOD', 'JOB', 'LUXURY', 'SHIP'];

export default function MarketTab({ onSend }: Props) {
  const marketTopCards = useGameStore(s => s.marketTopCards);
  const phase = useGameStore(s => s.phase);
  const mySessionId = useGameStore(s => s.mySessionId);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const players = useGameStore(s => s.players);

  const myPlayer = players.get(mySessionId);
  const isMyTurn = activePlayerId === mySessionId;
  const canBuy = phase === 'ACTION' && isMyTurn;

  const handleBuy = (deckType: MarketDeckType) => {
    onSend({ type: 'MARKET_BUY', payload: { deckType } });
  };

  const handleDiscard = (deckType: MarketDeckType) => {
    onSend({ type: 'MARKET_DISCARD', payload: { deckType } });
  };

  return (
    <div>
      <h3 style={styles.heading}>MARKET</h3>
      {myPlayer && (
        <p style={styles.credits}>Credits: {myPlayer.credits} cr</p>
      )}

      <div style={styles.deckList}>
        {DECK_TYPES.map(deckType => {
          const cardId = marketTopCards[deckType] ?? -1;
          const card = cardId > 0 ? MARKET_CARDS.find(c => c.id === cardId) : null;

          return (
            <div key={deckType} style={styles.deckItem}>
              <div style={styles.deckHeader}>
                <span style={styles.deckName}>{MARKET_DECK_NAMES[deckType] ?? deckType}</span>
                {card && (
                  <span style={styles.cardCost}>{card.buyCost > 0 ? `${card.buyCost}cr` : 'FREE'}</span>
                )}
              </div>

              {card ? (
                <div style={styles.cardInfo}>
                  <strong>{card.name}</strong>
                  <p style={styles.cardEffect}>{card.effectDescription}</p>
                  {card.flavorText && (
                    <p style={styles.flavor}>"{card.flavorText}"</p>
                  )}
                </div>
              ) : (
                <p style={styles.emptyDeck}>— Deck empty —</p>
              )}

              <div style={styles.cardActions}>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleDiscard(deckType)}
                  disabled={!canBuy}
                >
                  DISCARD
                </button>
                {card && card.buyCost > 0 && (
                  <button
                    style={{ ...styles.actionBtn, ...styles.buyBtn }}
                    onClick={() => handleBuy(deckType)}
                    disabled={!canBuy || (myPlayer?.credits ?? 0) < card.buyCost}
                  >
                    BUY
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: {
    fontSize: '0.85rem',
    color: '#ffd700',
    marginBottom: '0.25rem',
  },
  credits: {
    fontSize: '0.8rem',
    color: '#00ff88',
    marginBottom: '0.75rem',
  },
  deckList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  deckItem: {
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
  },
  deckHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.3rem',
  },
  deckName: {
    fontSize: '0.7rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardCost: {
    fontSize: '0.7rem',
    color: '#ffd700',
    fontWeight: 'bold',
  },
  cardInfo: {
    marginBottom: '0.4rem',
    fontSize: '0.75rem',
    color: '#ccc',
  },
  cardEffect: {
    fontSize: '0.7rem',
    color: '#999',
    marginTop: '0.15rem',
  },
  flavor: {
    fontSize: '0.65rem',
    color: '#666',
    fontStyle: 'italic',
    marginTop: '0.15rem',
  },
  emptyDeck: {
    fontSize: '0.7rem',
    color: '#555',
    fontStyle: 'italic',
  },
  cardActions: {
    display: 'flex',
    gap: '0.4rem',
  },
  actionBtn: {
    padding: '0.25rem 0.6rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '3px',
    color: '#888',
    cursor: 'pointer',
    fontSize: '0.6rem',
    fontFamily: "'Courier New', monospace",
  },
  buyBtn: {
    background: 'rgba(0, 255, 136, 0.08)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    color: '#00ff88',
  },
};

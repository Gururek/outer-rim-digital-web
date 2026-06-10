import { useGameStore } from '../../../stores/gameStore';
import type { ClientMessage, MarketDeckType, CargoCard } from '@outer-rim/shared';
import { MARKET_CARDS, MARKET_DECK_NAMES, MAP_NODES, getCardById } from '@outer-rim/shared';

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
  const canAct = phase === 'ACTION' && isMyTurn;
  const currentPlanet = myPlayer ? MAP_NODES.find(n => n.id === myPlayer.currentNodeId) : null;

  // Collect owned card IDs from inventory slots
  const ownedCards = myPlayer ? [
    ...myPlayer.cargoSlots,
    ...myPlayer.gearSlots,
    ...myPlayer.modSlots,
    ...myPlayer.jobBountySlots,
    ...myPlayer.crewSlots,
  ] : [];

  // Find deliverable cargo (player is at destination planet)
  const deliverableCargo = ownedCards
    .map(id => getCardById(id))
    .filter((c): c is CargoCard =>
      c !== undefined && c.deckType === 'CARGO' && currentPlanet != null &&
      Number((c as any).destinationPlanetId) === (currentPlanet as any).id
    );

  // Find all owned cargo (showing destination)
  const ownedCargo = ownedCards
    .map(id => getCardById(id))
    .filter((c): c is CargoCard => c !== undefined && c.deckType === 'CARGO');

  const handleBuy = (deckType: MarketDeckType) => {
    onSend({ type: 'MARKET_BUY', payload: { deckType } });
  };

  const handleDiscard = (deckType: MarketDeckType) => {
    onSend({ type: 'MARKET_DISCARD', payload: { deckType } });
  };

  const handleDeliver = (slotIndex: number) => {
    onSend({ type: 'DELIVER_CARGO', payload: { cardSlotIndex: slotIndex } });
  };

  return (
    <div>
      <h3 style={styles.heading}>MARKET</h3>
      {myPlayer && (
        <div style={styles.statusBar}>
          <span style={styles.credits}>{myPlayer.credits} cr</span>
          <span style={styles.location}>
            {currentPlanet ? `📍 ${currentPlanet.name}` : 'In space'}
          </span>
        </div>
      )}

      {/* Deliverable cargo alert */}
      {deliverableCargo.length > 0 && (
        <div style={styles.deliveryAlert}>
          <div style={styles.alertTitle}>🚚 CARGO DELIVERY AVAILABLE</div>
          {deliverableCargo.map((card, i) => (
            <div key={card.id} style={styles.deliveryItem}>
              <span>{card.name}</span>
              <span style={styles.reward}>
                +{card.deliveryReward ?? card.buyCost * 2} cr
              </span>
              <button
                style={styles.deliverBtn}
                onClick={() => handleDeliver(i)}
                disabled={!canAct}
              >
                DELIVER
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Owned cargo section */}
      {ownedCargo.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>YOUR CARGO</div>
          {ownedCargo.map((card) => {
            const destNode = MAP_NODES.find(n => n.id === Number(card.destinationPlanetId));
            const isAtDest = currentPlanet != null && Number(card.destinationPlanetId) === currentPlanet.id;
            return (
              <div key={card.id} style={{ ...styles.ownedItem, borderColor: isAtDest ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)' }}>
                <span style={{ color: isAtDest ? '#00ff88' : '#ccc' }}>{card.name}</span>
                <span style={styles.smallText}>→ {destNode?.name ?? 'Unknown'}</span>
                {card.isIllegal && <span style={styles.illegalBadge}>ILLEGAL</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Other owned inventory */}
      {ownedCards.filter(id => {
        const c = getCardById(id);
        return c && c.deckType !== 'CARGO';
      }).length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>EQUIPMENT</div>
          {ownedCards.map(id => {
            const c = getCardById(id);
            if (!c || c.deckType === 'CARGO') return null;
            return (
              <div key={id} style={styles.ownedItem}>
                <span style={{ color: '#ccc' }}>{c.name}</span>
                <span style={styles.smallText}>
                  {c.deckType === 'GEAR_MOD' ? (c as any).isGear ? 'GEAR' : 'MOD' :
                   c.deckType === 'JOB' ? 'JOB' : c.deckType}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div style={styles.divider}>MARKET PLACE</div>

      {/* Market decks */}
      <div style={styles.deckList}>
        {DECK_TYPES.map(deckType => {
          const cardId = marketTopCards[deckType] ?? -1;
          const card = cardId > 0 ? MARKET_CARDS.find(c => c.id === cardId) : null;

          return (
            <div key={deckType} style={styles.deckItem}>
              <div style={styles.deckHeader}>
                <span style={styles.deckName}>{MARKET_DECK_NAMES[deckType] ?? deckType}</span>
                {card && (
                  <span style={styles.cardCost}>
                    {card.buyCost > 0 ? `${card.buyCost}cr` : 'FREE'}
                  </span>
                )}
              </div>

              {card ? (
                <div style={styles.cardInfo}>
                  <strong>{card.name}</strong>
                  <p style={styles.cardEffect}>{card.effectDescription}</p>
                  {card.flavorText && (
                    <p style={styles.flavor}>"{card.flavorText}"</p>
                  )}
                  {/* Show cargo destination */}
                  {'destinationPlanetId' in card && (
                    <p style={styles.cargoDest}>
                      Deliver to: {
                        MAP_NODES.find(n => n.id === Number((card as any).destinationPlanetId))?.name ?? 'Unknown'
                      }
                    </p>
                  )}
                  {/* Show mod bonuses */}
                  {'hyperdriveBonus' in card && (card as any).hyperdriveBonus && (
                    <p style={styles.bonusText}>Hyperdrive +{(card as any).hyperdriveBonus}</p>
                  )}
                  {'hullBonus' in card && (card as any).hullBonus && (
                    <p style={styles.bonusText}>Hull +{(card as any).hullBonus}</p>
                  )}
                  {'attackDiceBonus' in card && (card as any).attackDiceBonus && (
                    <p style={styles.bonusText}>Combat +{(card as any).attackDiceBonus}</p>
                  )}
                </div>
              ) : (
                <p style={styles.emptyDeck}>— Deck empty —</p>
              )}

              <div style={styles.cardActions}>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleDiscard(deckType)}
                  disabled={!canAct}
                  title={!canAct ? 'Only during your ACTION phase' : 'Cycle this card to the bottom of the deck'}
                >
                  DISCARD
                </button>
                {card && (
                  <button
                    style={{ ...styles.actionBtn, ...styles.buyBtn }}
                    onClick={() => handleBuy(deckType)}
                    disabled={!canAct || (myPlayer?.credits ?? 0) < card.buyCost}
                    title={
                      !canAct ? 'Only during your ACTION phase' :
                      (myPlayer?.credits ?? 0) < card.buyCost ? 'Not enough credits' :
                      'Purchase this card'
                    }
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
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  credits: {
    fontSize: '0.8rem',
    color: '#00ff88',
    fontWeight: 'bold',
  },
  location: {
    fontSize: '0.7rem',
    color: '#888',
  },
  deliveryAlert: {
    background: 'rgba(0, 255, 136, 0.08)',
    border: '1px solid rgba(0, 255, 136, 0.2)',
    borderRadius: '4px',
    padding: '0.5rem',
    marginBottom: '0.75rem',
  },
  alertTitle: {
    fontSize: '0.7rem',
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: '0.4rem',
    letterSpacing: '0.05em',
  },
  deliveryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.2rem 0',
    fontSize: '0.75rem',
    color: '#ccc',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  reward: {
    fontSize: '0.7rem',
    color: '#ffd700',
  },
  deliverBtn: {
    padding: '0.15rem 0.4rem',
    background: 'rgba(0, 255, 136, 0.15)',
    border: '1px solid rgba(0, 255, 136, 0.3)',
    borderRadius: '3px',
    color: '#00ff88',
    cursor: 'pointer',
    fontSize: '0.6rem',
    fontFamily: "'Courier New', monospace",
  },
  section: {
    marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: '0.65rem',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    marginBottom: '0.3rem',
  },
  ownedItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.2rem 0.4rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '3px',
    fontSize: '0.7rem',
    marginBottom: '0.15rem',
  },
  smallText: {
    fontSize: '0.6rem',
    color: '#666',
  },
  illegalBadge: {
    fontSize: '0.55rem',
    color: '#ff4444',
    border: '1px solid rgba(255,68,68,0.3)',
    borderRadius: '2px',
    padding: '0.05rem 0.25rem',
  },
  bonusText: {
    fontSize: '0.6rem',
    color: '#88ccff',
    marginTop: '0.1rem',
  },
  divider: {
    fontSize: '0.6rem',
    color: '#555',
    textAlign: 'center' as const,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '0.3rem 0',
    margin: '0.5rem 0',
    letterSpacing: '0.1em',
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
  cargoDest: {
    fontSize: '0.65rem',
    color: '#88aacc',
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

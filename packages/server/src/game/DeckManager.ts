import type { GameState } from '../rooms/schema/GameState.js';
import type { MarketDeckType } from '@outer-rim/shared';
import { MARKET_CARDS, MAP_NODES, getCardsByDeck } from '@outer-rim/shared';

export class DeckManager {
  private decks: Map<MarketDeckType, number[]>;

  constructor(private state: GameState) {
    this.decks = new Map();
  }

  initialize() {
    for (const deckType of ['BOUNTY', 'CARGO', 'GEAR_MOD', 'JOB', 'LUXURY', 'SHIP'] as MarketDeckType[]) {
      const cards = getCardsByDeck(deckType);
      const shuffled = this.shuffleArray(cards.map(c => c.id));
      this.decks.set(deckType, shuffled);
      this.revealTop(deckType);
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private revealTop(deckType: MarketDeckType) {
    const deck = this.decks.get(deckType);
    const topId = deck && deck.length > 0 ? deck[0] : -1;
    switch (deckType) {
      case 'BOUNTY':   this.state.topBountyId  = topId; break;
      case 'CARGO':    this.state.topCargoId   = topId; break;
      case 'GEAR_MOD': this.state.topGearModId = topId; break;
      case 'JOB':      this.state.topJobId     = topId; break;
      case 'LUXURY':   this.state.topLuxuryId  = topId; break;
      case 'SHIP':     this.state.topShipId    = topId; break;
    }
  }

  getTopCardId(deckType: MarketDeckType): number {
    const deck = this.decks.get(deckType);
    return deck && deck.length > 0 ? deck[0] : -1;
  }

  getTopCard(deckType: MarketDeckType) {
    const id = this.getTopCardId(deckType);
    return id > 0 ? MARKET_CARDS.find(c => c.id === id) : null;
  }

  handleDiscard(sessionId: string, deckType: MarketDeckType) {
    const deck = this.decks.get(deckType);
    if (!deck || deck.length === 0) return;

    // Discard top card: move to bottom (cycle)
    const discarded = deck.shift()!;
    deck.push(discarded);
    this.revealTop(deckType);
  }

  handleBuy(sessionId: string, deckType: MarketDeckType): number | null {
    const deck = this.decks.get(deckType);
    if (!deck || deck.length === 0) return null;

    const cardId = this.getTopCardId(deckType);
    const card = MARKET_CARDS.find(c => c.id === cardId);
    if (!card) return null;

    const ps = this.state.players.get(sessionId);
    if (!ps) return null;

    // Check if player can afford it
    if (ps.credits < card.buyCost) return null;

    // Deduct credits
    ps.credits -= card.buyCost;

    // Remove from deck (purchased)
    deck.shift();
    this.revealTop(deckType);

    return cardId;
  }

  // Handle patrol movement icon on card discard
  getPatrolTrigger(deckType: MarketDeckType): { faction?: string; distance?: number } | null {
    const card = this.getTopCard(deckType);
    if (card && 'patrolMovementFaction' in card && card.patrolMovementFaction) {
      return {
        faction: card.patrolMovementFaction,
        distance: (card as any).patrolMovementDistance ?? 1
      };
    }
    return null;
  }

  handleDeliverCargo(sessionId: string, cardSlotIndex: number): { card: any; reward: number } | null {
    const ps = this.state.players.get(sessionId);
    if (!ps) return null;

    // Find the cargo card in player's inventory
    const cargoSlots = ps.cargoSlots;
    if (cardSlotIndex >= cargoSlots.length) return null;

    const slot = cargoSlots[cardSlotIndex];
    if (!slot || !slot.isOccupied) return null;

    const card = MARKET_CARDS.find(c => c.id === slot.cardDefinitionId);
    if (!card || card.deckType !== 'CARGO') return null;

    const cargoCard = card as import('@outer-rim/shared').CargoCard;
    
    // Resolve destination: destinationPlanetId is the node's planetId string (e.g. 'tatooine')
    const destNode = MAP_NODES.find(n => n.planetId === cargoCard.destinationPlanetId);
    if (!destNode || ps.currentNodeId !== destNode.id) return null;

    const reward = cargoCard.deliveryReward ?? cargoCard.buyCost * 2;

    // Remove from inventory
    slot.isOccupied = false;
    slot.cardDefinitionId = -1;
    slot.isRotated = false;

    // Pay the player
    ps.credits += reward;

    return { card: cargoCard, reward };
  }
}

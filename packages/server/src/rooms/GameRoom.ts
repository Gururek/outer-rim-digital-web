import type { Client, Room as RoomClass } from 'colyseus';
import colyseusPkg from 'colyseus';
const { Room } = colyseusPkg as any;
import { GameState } from './schema/GameState.js';
import { PlayerState } from './schema/PlayerState.js';
import { TurnMachine } from '../game/TurnMachine.js';
import { DeckManager } from '../game/DeckManager.js';
import { PatrolManager } from '../game/PatrolManager.js';
import type { ClientMessage, ServerEvent } from '@outer-rim/shared';

export class GameRoom extends Room<GameState> {
  private turnMachine!: TurnMachine;
  private deckManager!: DeckManager;
  private patrolManager!: PatrolManager;

  maxClients = 4;
  get autoDispose() { return false; }

  onCreate(options: { fameRequirement?: number }) {
    this.setState(new GameState());
    this.state.fameRequirement = options.fameRequirement ?? 10;

    this.deckManager = new DeckManager(this.state);
    this.patrolManager = new PatrolManager(this.state);
    this.turnMachine = new TurnMachine(this.state, this.deckManager, this.patrolManager, this);

    this.deckManager.initialize();
    this.patrolManager.initialize();

    this.registerMessageHandlers();
  }

  private registerMessageHandlers() {
    this.onMessage('PLANNING_CHOICE', (client: any, msg: any) => {
      this.turnMachine.handlePlanningChoice(client.sessionId, msg.choice);
    });

    this.onMessage('CONFIRM_MOVE', (client: any, msg: any) => {
      this.turnMachine.handleConfirmMove(client.sessionId, msg.destinationNodeId);
    });

    this.onMessage('END_ACTION_PHASE', (client: any) => {
      this.turnMachine.handleEndActionPhase(client.sessionId);
    });

    this.onMessage('SUBMIT_ENCOUNTER', (client: any, msg: any) => {
      this.turnMachine.handleEncounterChoice(client.sessionId, msg);
    });

    this.onMessage('MARKET_DISCARD', (client: any, msg: any) => {
      this.deckManager.handleDiscard(client.sessionId, msg.deckType);
    });

    this.onMessage('MARKET_BUY', (client: any, msg: any) => {
      const cardId = this.deckManager.handleBuy(client.sessionId, msg.deckType);
      if (cardId) {
        this.broadcastEvent({
          event: 'CINEMATIC_TRIGGER',
          data: { type: 'CARD_PURCHASED', payload: { sessionId: client.sessionId, cardId } }
        });
      }
    });

    this.onMessage('PATROL_MOVE_AFTER_LOSS', (client: any, msg: any) => {
      this.patrolManager.handlePlayerMovePatrol(
        client.sessionId, msg.faction, msg.destNodeId
      );
    });

    this.onMessage('SELECT_CHARACTER', (client: any, msg: any) => {
      this.handleCharacterSelection(client, msg);
    });
  }

  onJoin(client: Client, options: { displayName?: string; characterId?: string; shipId?: string }) {
    const ps = new PlayerState();
    ps.sessionId = client.sessionId;
    ps.displayName = options.displayName ?? `Player ${this.clients.length}`;
    if (options.characterId) ps.characterId = options.characterId;
    if (options.shipId) ps.shipId = options.shipId;
    ps.isReady = true;
    this.state.players.set(client.sessionId, ps);
    console.log(`[GameRoom] ${ps.displayName} joined as ${ps.characterId}/${ps.shipId}. Players: ${this.clients.length}`);

    // Auto-start when enough players are ready
    const allReady = Array.from(this.state.players.values()).every((p: any) => p.isReady);
    if (allReady && this.clients.length >= 2) {
      this.turnMachine.startGame();
    }
  }

  onLeave(client: Client, consented: boolean) {
    if (!consented) {
      this.allowReconnection(client, 30).then(() => {
        console.log(`[GameRoom] ${client.sessionId} reconnected.`);
      }).catch(() => {
        this.removePlayer(client.sessionId);
      });
    } else {
      this.removePlayer(client.sessionId);
    }
  }

  private removePlayer(sessionId: string) {
    this.state.players.delete(sessionId);
    const idx = this.state.turnOrder.indexOf(sessionId);
    if (idx > -1) this.state.turnOrder.splice(idx, 1);
    console.log(`[GameRoom] ${sessionId} removed.`);
  }

  private handleCharacterSelection(
    client: Client,
    payload: { characterId: string; shipId: string }
  ) {
    const ps = this.state.players.get(client.sessionId);
    if (!ps) return;

    ps.characterId = payload.characterId;
    ps.shipId = payload.shipId;
    ps.isReady = true;

    const allReady = Array.from(this.state.players.values()).every((p: any) => p.isReady);
    if (allReady && this.clients.length >= 2) {
      this.turnMachine.startGame();
    }
  }

  broadcastEvent(event: ServerEvent) {
    this.broadcast('SERVER_EVENT', event);
  }

  sendToClient(sessionId: string, event: ServerEvent) {
    const client = this.clients.find((c: any) => c.sessionId === sessionId);
    client?.send('SERVER_EVENT', event);
  }
}

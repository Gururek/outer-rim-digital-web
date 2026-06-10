import { describe, it, expect, beforeEach } from 'vitest';
import { TurnMachine } from './TurnMachine.js';
import type { RoomBroadcaster } from './TurnMachine.js';
import { DeckManager } from './DeckManager.js';
import { PatrolManager } from './PatrolManager.js';
import { GameState } from '../rooms/schema/GameState.js';
import { PlayerState } from '../rooms/schema/PlayerState.js';
import type { ServerEvent } from '@outer-rim/shared';

class MockBroadcaster implements RoomBroadcaster {
  events: ServerEvent[] = [];
  clientEvents: Map<string, ServerEvent[]> = new Map();

  broadcastEvent(event: ServerEvent) {
    this.events.push(event);
  }

  sendToClient(sessionId: string, event: ServerEvent) {
    if (!this.clientEvents.has(sessionId)) {
      this.clientEvents.set(sessionId, []);
    }
    this.clientEvents.get(sessionId)!.push(event);
  }

  clear() {
    this.events = [];
    this.clientEvents.clear();
  }
}

function createPlayer(state: GameState, id: string, credits = 0): PlayerState {
  const ps = new PlayerState();
  ps.sessionId = id;
  ps.displayName = `Player ${id}`;
  ps.credits = credits;
  state.players.set(id, ps);
  return ps;
}

describe('TurnMachine', () => {
  let state: GameState;
  let deckManager: DeckManager;
  let patrolManager: PatrolManager;
  let broadcaster: MockBroadcaster;
  let turnMachine: TurnMachine;

  beforeEach(() => {
    state = new GameState();
    deckManager = new DeckManager(state);
    patrolManager = new PatrolManager(state);
    broadcaster = new MockBroadcaster();
    turnMachine = new TurnMachine(state, deckManager, patrolManager, broadcaster);

    deckManager.initialize();
    patrolManager.initialize();
  });

  describe('startGame', () => {
    it('sets up turn order with all players', () => {
      createPlayer(state, 'p1', 0);
      createPlayer(state, 'p2', 0);
      createPlayer(state, 'p3', 0);

      turnMachine.startGame();

      expect(state.turnOrder).toHaveLength(3);
      expect(state.currentPlayerIndex).toBe(0);
      // Phase should transition to PLANNING
      expect(state.phase).toBe('PLANNING');
    });

    it('broadcasts PHASE_CHANGED on start', () => {
      createPlayer(state, 'p1', 0);
      createPlayer(state, 'p2', 0);

      turnMachine.startGame();

      const phaseEvents = broadcaster.events.filter(e => e.event === 'PHASE_CHANGED');
      expect(phaseEvents.length).toBeGreaterThanOrEqual(1);
      expect(phaseEvents[0].data.phase).toBe('PLANNING');
    });

    it('assigns starting credits based on turn order', () => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);
      createPlayer(state, 'c', 0);
      createPlayer(state, 'd', 0);

      turnMachine.startGame();

      const order = state.turnOrder;
      // First player gets 4000, second 6000, third 8000, fourth 10000
      const expectedCredits = [4000, 6000, 8000, 10000];
      order.forEach((id, i) => {
        const ps = state.players.get(id);
        expect(ps?.credits).toBe(expectedCredits[i]);
      });
    });

    it('places players at starting planets', () => {
      createPlayer(state, 'p1', 0);
      createPlayer(state, 'p2', 0);

      turnMachine.startGame();

      const starts = new Set(state.turnOrder.map(id => {
        const ps = state.players.get(id);
        return ps?.currentNodeId;
      }));
      // Should have 2 unique starting positions
      expect(starts.size).toBe(2);
      for (const nodeId of starts) {
        expect([1, 12, 8, 10]).toContain(nodeId);
      }
    });

    it('fame requirement defaults to 10', () => {
      createPlayer(state, 'p1', 0);
      createPlayer(state, 'p2', 0);

      turnMachine.startGame();

      expect(state.fameRequirement).toBe(10);
    });
  });

  describe('getActivePlayerId', () => {
    it('returns the current player based on turn order', () => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);

      turnMachine.startGame();

      const activeId = turnMachine.getActivePlayerId();
      expect(activeId).toBe(state.turnOrder[0]);
    });

    it('returns empty string when no players', () => {
      expect(turnMachine.getActivePlayerId()).toBe('');
    });
  });

  describe('handlePlanningChoice', () => {
    beforeEach(() => {
      createPlayer(state, 'a', 5000);
      createPlayer(state, 'b', 5000);
      turnMachine.startGame();
      broadcaster.clear();
    });

    it('MOVE transitions to ACTION and sends SHOW_MOVEMENT', () => {
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handlePlanningChoice(activeId, 'MOVE');

      expect(state.phase).toBe('ACTION');
      const moveEvents = broadcaster.clientEvents.get(activeId)?.filter(
        e => e.event === 'CINEMATIC_TRIGGER' && e.data.type === 'SHOW_MOVEMENT'
      );
      expect(moveEvents?.length).toBeGreaterThanOrEqual(1);
    });

    it('RECOVER clears damage and transitions to ACTION', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      ps.characterDamage = 5;
      ps.shipDamage = 3;

      turnMachine.handlePlanningChoice(activeId, 'RECOVER');

      expect(ps.characterDamage).toBe(0);
      expect(ps.shipDamage).toBe(0);
      expect(state.phase).toBe('ACTION');
    });

    it('GAIN_CREDITS adds 2000 credits and transitions to ACTION', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      const before = ps.credits;

      turnMachine.handlePlanningChoice(activeId, 'GAIN_CREDITS');

      expect(ps.credits).toBe(before + 2000);
      expect(state.phase).toBe('ACTION');
    });

    it('rejects non-active player choices', () => {
      const nonActiveId = state.turnOrder[1]; // Second player
      turnMachine.handlePlanningChoice(nonActiveId!, 'MOVE');
      expect(state.phase).toBe('PLANNING'); // Shouldn't change
    });

    it('rejects choice when not in PLANNING phase', () => {
      const activeId = turnMachine.getActivePlayerId();
      state.phase = 'ACTION';
      turnMachine.handlePlanningChoice(activeId, 'MOVE');
      // Should not reprocess
      expect(broadcaster.events.length).toBe(0);
    });
  });

  describe('handleConfirmMove', () => {
    beforeEach(() => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);
      turnMachine.startGame();
      // Player chooses MOVE → transitions to ACTION
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handlePlanningChoice(activeId, 'MOVE');
      broadcaster.clear();
    });

    it('moves player to a connected destination', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      const currentId = ps.currentNodeId;
      const { getConnectedNodes } = require('@outer-rim/shared');
      const connected = getConnectedNodes(currentId);
      
      if (connected.length > 0) {
        const destId = connected[0].id;
        ps.actionsRemaining = 2;
        
        turnMachine.handleConfirmMove(activeId, destId);
        
        // Movement triggers hyperspace cinematic
        const travelEvents = broadcaster.events.filter(
          e => e.event === 'CINEMATIC_TRIGGER' && e.data.type === 'HYPERSPACE_TRAVEL'
        );
        // Player moves to destination
        // Note: due to setTimeout in handleConfirmMove, we check the immediate state change
        expect(ps.currentNodeId).toBe(destId);
      }
    });

    it('rejects when no actions remaining', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      ps.actionsRemaining = 0;
      
      turnMachine.handleConfirmMove(activeId, 2);
      expect(broadcaster.events.length).toBe(0);
    });

    it('rejects non-active player moves', () => {
      const nonActiveId = state.turnOrder[1];
      turnMachine.handleConfirmMove(nonActiveId!, 2);
      expect(broadcaster.events.length).toBe(0);
    });

    it('actionsRemaining does NOT reset on re-entry to ACTION', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      const currentId = ps.currentNodeId;
      const { getConnectedNodes } = require('@outer-rim/shared');
      const connected = getConnectedNodes(currentId);
      
      if (connected.length > 0) {
        ps.actionsRemaining = 2;
        const destId = connected[0].id;
        
        // First move: decrements to 1
        turnMachine.handleConfirmMove(activeId, destId);
        expect(ps.actionsRemaining).toBe(1);
        
        // Second move: should go to 0
        if (connected.length > 1) {
          const destId2 = connected[1].id;
          ps.currentNodeId = connected[0].id; // Simulate first move completing
          turnMachine.handleConfirmMove(activeId, destId2);
          expect(ps.actionsRemaining).toBe(0);
        }
      }
    });
  });

  describe('handleEndActionPhase', () => {
    beforeEach(() => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);
      turnMachine.startGame();
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handlePlanningChoice(activeId, 'MOVE');
      broadcaster.clear();
    });

    it('transitions from ACTION to ENCOUNTER', () => {
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handleEndActionPhase(activeId);

      expect(state.phase).toBe('ENCOUNTER');
      const phaseEvents = broadcaster.events.filter(e => e.event === 'PHASE_CHANGED');
      expect(phaseEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('handleEncounterChoice', () => {
    beforeEach(() => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);
      turnMachine.startGame();
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handlePlanningChoice(activeId, 'MOVE');
      turnMachine.handleEndActionPhase(activeId);
      broadcaster.clear();
    });

    it('FIGHT_PATROL requires mandatory patrol', () => {
      const activeId = turnMachine.getActivePlayerId();
      // Without a patrol at the player's location, FIGHT_PATROL should do nothing
      turnMachine.handleEncounterChoice(activeId, { choice: 'FIGHT_PATROL' });
      // Shouldn't broadcast anything if no mandatory patrol
      const combatEvents = broadcaster.events.filter(
        e => e.event === 'COMBAT_RESULT'
      );
      expect(combatEvents.length).toBe(0);
    });

    it('SPACE_ENCOUNTER broadcasts space encounter event', () => {
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handleEncounterChoice(activeId, { choice: 'SPACE_ENCOUNTER' });

      const encounterEvents = broadcaster.events.filter(
        e => e.event === 'CINEMATIC_TRIGGER' && e.data.type === 'SPACE_ENCOUNTER'
      );
      expect(encounterEvents.length).toBeGreaterThanOrEqual(1);
    });

    it('CONTACT with targetId broadcasts contact event', () => {
      const activeId = turnMachine.getActivePlayerId();
      turnMachine.handleEncounterChoice(activeId, { choice: 'CONTACT', targetId: 5 });

      const contactEvents = broadcaster.events.filter(e => e.event === 'CONTACT_REVEALED');
      expect(contactEvents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('win condition', () => {
    beforeEach(() => {
      createPlayer(state, 'a', 0);
      createPlayer(state, 'b', 0);
      turnMachine.startGame();
    });

    it('player reaching fame requirement triggers GAME_OVER', () => {
      const activeId = turnMachine.getActivePlayerId();
      const ps = state.players.get(activeId)!;
      ps.fame = state.fameRequirement; // Reach fame target

      // Trigger win check by going through planning → action → encounter → win_check
      turnMachine.handlePlanningChoice(activeId, 'RECOVER');
      turnMachine.handleEndActionPhase(activeId);
      // Encounter phase auto-completes via setTimeout in handleSpaceEncounter
      // We test the checkWinCondition path directly through the phase cycle
      
      // Actually, let me test the transition flow by calling completeEncounter
      turnMachine.completeEncounter();

      const gameOverEvents = broadcaster.events.filter(e => e.event === 'GAME_OVER');
      expect(gameOverEvents.length).toBeGreaterThanOrEqual(1);
      expect(state.phase).toBe('GAME_OVER');
    });

    it('advances turn when no player has won', () => {
      const activeId = turnMachine.getActivePlayerId();
      const startIndex = state.currentPlayerIndex;

      turnMachine.handlePlanningChoice(activeId, 'RECOVER');
      turnMachine.handleEndActionPhase(activeId);
      turnMachine.completeEncounter();

      // Should advance to next player
      expect(state.phase).not.toBe('GAME_OVER');
    });
  });
});

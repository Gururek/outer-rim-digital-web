import type { GameState } from '../rooms/schema/GameState.js';
import type { DeckManager } from './DeckManager.js';
import type { PatrolManager } from './PatrolManager.js';
import { CombatResolver } from './CombatResolver.js';
import { findPath, MAP_NODES, CHARACTERS, getShip } from '@outer-rim/shared';
import type {
  GamePhase, PlanningChoice, EncounterChoice,
  FactionType, ServerEvent
} from '@outer-rim/shared';
import { CREDITS_FROM_RESTING, DEFEAT_CREDIT_PENALTY } from '@outer-rim/shared';

export interface RoomBroadcaster {
  broadcastEvent(event: ServerEvent): void;
  sendToClient(sessionId: string, event: ServerEvent): void;
}

export class TurnMachine {
  private combatResolver: CombatResolver;
  private planningResolved = false;
  private actionPhaseEntered = false; // Track first entry to ACTION per turn

  constructor(
    private state: GameState,
    private deckManager: DeckManager,
    private patrolManager: PatrolManager,
    private room: RoomBroadcaster
  ) {
    this.combatResolver = new CombatResolver();
  }

  // ─── START ──────────────────────────────────────────────────────────────────

  startGame() {
    const sessionIds = Array.from(this.state.players.keys());
    // Shuffle turn order
    for (let i = sessionIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sessionIds[i], sessionIds[j]] = [sessionIds[j], sessionIds[i]];
    }
    this.state.turnOrder.push(...sessionIds);

    // Assign starting credits by turn order position: 4k, 6k, 8k, 10k
    const startCredits = [4000, 6000, 8000, 10000];
    this.state.turnOrder.forEach((id: string, i: number) => {
      const ps = this.state.players.get(id);
      if (ps) ps.credits = startCredits[Math.min(i, startCredits.length - 1)];
    });

    // Place players at starting positions
    sessionIds.forEach((id, i) => {
      const ps = this.state.players.get(id);
      if (ps) {
        // Starting planets: Tatooine (1), Nal Hutta (12), Corellia (8), Ord Mantell (10)
        const starts = [1, 12, 8, 10];
        ps.currentNodeId = starts[Math.min(i, starts.length - 1)];
      }
    });

    this.transitionTo('PLANNING');
  }

  // ─── PHASE TRANSITIONS ──────────────────────────────────────────────────────

  private transitionTo(phase: GamePhase) {
    this.planningResolved = false;
    this.state.phase = phase;

    const activeId = this.getActivePlayerId();
    
    // Only reset actions on FIRST entry to ACTION (from PLANNING), not on re-entry from moves
    if (phase === 'ACTION') {
      if (!this.actionPhaseEntered) {
        this.actionPhaseEntered = true;
        const activePs = this.state.players.get(activeId);
        if (activePs) activePs.actionsRemaining = 2;
      }
    } else if (phase === 'PLANNING') {
      this.actionPhaseEntered = false;
    }
    
    this.room.broadcastEvent({
      event: 'PHASE_CHANGED',
      data: { phase, activePlayerId: activeId }
    });

    if (phase === 'ENCOUNTER') {
      const mandatory = this.patrolManager.getMandatoryPatrolFaction(activeId);
      if (mandatory) {
        this.room.sendToClient(activeId, {
          event: 'CINEMATIC_TRIGGER',
          data: { type: 'FORCED_PATROL', payload: { faction: mandatory } }
        });
      }
    }

    if (phase === 'WIN_CHECK') this.checkWinCondition();
  }

  // ─── PLANNING PHASE ─────────────────────────────────────────────────────────

  handlePlanningChoice(sessionId: string, choice: PlanningChoice) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'PLANNING' || this.planningResolved) return;

    const ps = this.state.players.get(sessionId)!;

    // RULES: Defeated player MUST recover
    const isDefeated = this.isPlayerDefeated(ps);
    if (isDefeated && choice !== 'RECOVER') return;

    this.planningResolved = true;

    switch (choice) {
      case 'RECOVER':
        ps.characterDamage = 0;
        ps.shipDamage = 0;
        this.transitionTo('ACTION');
        break;

      case 'GAIN_CREDITS':
        ps.credits += CREDITS_FROM_RESTING;
        this.transitionTo('ACTION');
        break;

      case 'MOVE':
        this.room.sendToClient(sessionId, {
          event: 'CINEMATIC_TRIGGER',
          data: {
            type: 'SHOW_MOVEMENT',
            payload: {
              startNodeId: ps.currentNodeId,
              hyperdrive: this.getEffectiveHyperdrive(sessionId),
            }
          }
        });
        this.transitionTo('ACTION');
        break;
    }
  }

  handleConfirmMove(sessionId: string, destNodeId: number) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'ACTION') return;

    const ps = this.state.players.get(sessionId)!;
    
    // No actions left
    if (ps.actionsRemaining <= 0) return;
    
    const path = findPath(
      ps.currentNodeId, destNodeId, this.getEffectiveHyperdrive(sessionId)
    );
    if (!path) return;

    ps.currentNodeId = destNodeId;
    ps.actionsRemaining -= 1;

    this.room.broadcastEvent({
      event: 'CINEMATIC_TRIGGER',
      data: { type: 'HYPERSPACE_TRAVEL', payload: { sessionId, path } }
    });

    // Delay for animation, then proceed
    setTimeout(() => this.transitionTo('ACTION'), 3000);
  }

  // ─── ACTION PHASE ───────────────────────────────────────────────────────────

  handleEndActionPhase(sessionId: string) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'ACTION') return;
    this.transitionTo('ENCOUNTER');
  }

  // ─── ENCOUNTER PHASE ────────────────────────────────────────────────────────

  handleEncounterChoice(
    sessionId: string,
    payload: { choice: EncounterChoice; targetId?: number }
  ) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'ENCOUNTER') return;

    const mandatory = this.patrolManager.getMandatoryPatrolFaction(sessionId);

    switch (payload.choice) {
      case 'FIGHT_PATROL':
        if (!mandatory) return; // No patrol to fight
        this.handlePatrolCombat(sessionId, mandatory);
        break;
      case 'SPACE_ENCOUNTER':
        this.handleSpaceEncounter(sessionId);
        break;
      case 'CONTACT':
        // Accept with or without explicit targetId — auto-select if missing
        this.handleContactEncounter(sessionId, payload.targetId);
        break;
    }
  }

  private handlePatrolCombat(sessionId: string, faction: FactionType) {
    this.state.phase = 'COMBAT';
    const ps = this.state.players.get(sessionId)!;
    const patrol = this.patrolManager.getPatrol(faction);

    // RULES: Level-4 patrol — no dice, instant defeat
    if (patrol.level === 4) {
      ps.shipDamage = this.getShipMaxHull(sessionId);
      this.applyDefeatPenalty(ps);
      this.room.broadcastEvent({
        event: 'CINEMATIC_TRIGGER',
        data: { type: 'LEVEL4_PATROL', payload: { sessionId, faction } }
      });
      setTimeout(() => this.transitionTo('WIN_CHECK'), 5000);
      return;
    }

    const playerRoll = CombatResolver.rollDice(this.getShipCombatValue(sessionId));
    const patrolRoll = CombatResolver.rollDice(patrol.combatValue);

    // BOTH sides take opponent's damage
    ps.shipDamage = Math.min(
      ps.shipDamage + patrolRoll.totalDamage,
      this.getShipMaxHull(sessionId)
    );

    const playerWins = playerRoll.totalDamage >= patrolRoll.totalDamage;

    if (playerWins) {
      ps.credits += patrol.creditReward;
      ps.fame += patrol.fameReward;
      this.modifyRep(ps, faction, -1);
      this.patrolManager.eliminateAndSpawn(faction);
    } else {
      // Auto-move patrol one step toward nearest player and continue
      this.patrolManager.moveOnePatrolTowardPlayers(faction);
    }

    if (ps.shipDamage >= this.getShipMaxHull(sessionId)) {
      this.applyDefeatPenalty(ps);
    }

    this.room.broadcastEvent({
      event: 'DICE_ROLLED',
      data: {
        playerId: sessionId,
        rolls: [playerRoll, patrolRoll],
        context: 'PATROL_COMBAT'
      }
    });

    this.room.broadcastEvent({
      event: 'COMBAT_RESULT',
      data: {
        winnerId: playerWins ? sessionId : 'patrol',
        attackerDmg: playerRoll.totalDamage,
        defenderDmg: patrolRoll.totalDamage
      }
    });

    setTimeout(() => this.transitionTo('WIN_CHECK'), 4000);
  }

  private handleSpaceEncounter(sessionId: string) {
    const ps = this.state.players.get(sessionId)!;
    const node = MAP_NODES.find(n => n.id === ps.currentNodeId);
    
    // Randomized encounter outcomes
    const roll = Math.random();
    let outcome: string;
    let creditsGain = 0;
    let damage = 0;
    let fameGain = 0;
    
    if (roll < 0.25) {
      // Salvage: gain credits
      creditsGain = 1000 + Math.floor(Math.random() * 3000);
      outcome = `Salvage found! Gained ${creditsGain} credits from a derelict freighter.`;
      ps.credits += creditsGain;
    } else if (roll < 0.45) {
      // Asteroid field: minor hull damage
      damage = 1 + Math.floor(Math.random() * 2);
      ps.shipDamage = Math.min(ps.shipDamage + damage, this.getShipMaxHull(sessionId));
      outcome = `Asteroid field! Ship took ${damage} hull damage navigating the debris.`;
    } else if (roll < 0.60) {
      // Distress signal: gain fame for rescuing
      fameGain = 1;
      ps.fame += fameGain;
      outcome = `Distress signal! You rescued a stranded freighter crew. +${fameGain} Fame.`;
    } else if (roll < 0.80) {
      // Smuggler cache: minor credits
      creditsGain = 500 + Math.floor(Math.random() * 1500);
      outcome = `Smuggler's cache located. +${creditsGain} credits in contraband.`;
      ps.credits += creditsGain;
    } else {
      // Nothing found
      outcome = `Scans complete — nothing of interest in this sector.`;
    }
    
    this.room.broadcastEvent({
      event: 'CINEMATIC_TRIGGER',
      data: {
        type: 'SPACE_ENCOUNTER',
        payload: {
          sessionId,
          nodeId: ps.currentNodeId,
          nodeName: node?.name ?? 'Unknown',
          outcome,
          creditsGain,
          damage,
          fameGain,
        }
      }
    });
    
    // Check if destroyed by asteroid
    if (ps.shipDamage >= this.getShipMaxHull(sessionId)) {
      this.applyDefeatPenalty(ps);
      this.room.sendToClient(sessionId, {
        event: 'CINEMATIC_TRIGGER',
        data: { type: 'SHIP_DESTROYED', payload: { sessionId } }
      });
    }
    
    setTimeout(() => this.transitionTo('WIN_CHECK'), 4000);
  }

  private handleContactEncounter(sessionId: string, contactId?: number) {
    const ps = this.state.players.get(sessionId)!;
    const node = MAP_NODES.find(n => n.id === ps.currentNodeId);
    
    let resolvedContactId = contactId;
    let contactClass: string | undefined;
    
    if (resolvedContactId == null && node) {
      // Auto-select first available contact space at this node
      if (node.contactSpaces.length > 0) {
        const space = node.contactSpaces[0];
        resolvedContactId = node.id * 100 + node.contactSpaces.indexOf(space) + 1;
        contactClass = space.class;
      } else {
        // No contacts at this node — tell the player
        this.room.sendToClient(sessionId, {
          event: 'CINEMATIC_TRIGGER',
          data: { type: 'NO_CONTACTS', payload: { nodeId: ps.currentNodeId, nodeName: node?.name ?? 'here' } }
        });
        setTimeout(() => this.transitionTo('WIN_CHECK'), 2000);
        return;
      }
    }
    
    this.room.broadcastEvent({
      event: 'CONTACT_REVEALED',
      data: { contactId: resolvedContactId!, dataBankCardNumber: resolvedContactId! }
    });
    setTimeout(() => this.transitionTo('WIN_CHECK'), 3000);
  }

  completeEncounter() {
    this.transitionTo('WIN_CHECK');
  }

  // ─── WIN CONDITION ──────────────────────────────────────────────────────────

  private checkWinCondition() {
    for (const [id, ps] of this.state.players) {
      if (ps.fame >= this.state.fameRequirement) {
        this.state.phase = 'GAME_OVER';
        this.room.broadcastEvent({
          event: 'GAME_OVER',
          data: { winnerId: id, fame: ps.fame }
        });
        return;
      }
    }
    this.advanceTurn();
  }

  private advanceTurn() {
    const order = Array.from(this.state.turnOrder);
    const next = (this.state.currentPlayerIndex + 1) % order.length;
    if (next === 0) {
      this.state.turnNumber++;
      // Patrols move at end of round
      this.patrolManager.moveAllPatrolsTowardPlayers();
    }
    this.state.currentPlayerIndex = next;
    this.transitionTo('PLANNING');
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  getActivePlayerId(): string {
    return this.state.turnOrder[this.state.currentPlayerIndex] ?? '';
  }

  private validateActivePlayer(sessionId: string): boolean {
    return this.getActivePlayerId() === sessionId;
  }

  private isPlayerDefeated(
    ps: ReturnType<typeof this.state.players.get>
  ): boolean {
    if (!ps) return false;
    const character = CHARACTERS.find(c => c.id === ps.characterId);
    const maxHealth = character?.maxHealth ?? 8;
    return ps.characterDamage >= maxHealth;
  }

  private applyDefeatPenalty(
    ps: NonNullable<ReturnType<typeof this.state.players.get>>
  ) {
    ps.credits = Math.max(0, ps.credits - DEFEAT_CREDIT_PENALTY);
  }

  private getEffectiveHyperdrive(sessionId: string): number {
    const ps = this.state.players.get(sessionId);
    if (!ps) return 1;
    const ship = getShip(ps.shipId);
    let hyperdrive = ship?.hyperdrive ?? 4;
    // TODO: add mod bonuses from ps.modSlots
    return hyperdrive;
  }

  private getShipCombatValue(sessionId: string): number {
    const ps = this.state.players.get(sessionId);
    if (!ps) return 1;
    const ship = getShip(ps.shipId);
    return ship?.shipCombatValue ?? 3;
  }

  private getShipMaxHull(sessionId: string): number {
    const ps = this.state.players.get(sessionId);
    if (!ps) return 1;
    const ship = getShip(ps.shipId);
    return ship?.maxHull ?? 6;
  }

  private modifyRep(
    ps: NonNullable<ReturnType<typeof this.state.players.get>>,
    faction: FactionType,
    delta: number
  ) {
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    switch (faction) {
      case 'HUTT':      ps.repHutt      = clamp(ps.repHutt      + delta); break;
      case 'SYNDICATE': ps.repSyndicate = clamp(ps.repSyndicate + delta); break;
      case 'IMPERIAL':  ps.repImperial  = clamp(ps.repImperial  + delta); break;
      case 'REBEL':     ps.repRebel     = clamp(ps.repRebel     + delta); break;
    }
  }
}

# Technical Design Document — V3.0 (Web Browser Edition)
## Star Wars: Outer Rim — Digital
### TypeScript | React + Three.js | Colyseus Multiplayer | Node.js

**Supersedes:** V2.0 (Unity)  
**Platform:** Modern web browser (Chrome 90+, Firefox 88+, Safari 15+)  
**Target:** 2–4 players, sessions of 60–120 minutes

---

## Why Web?

| Concern | Unity | Web (this plan) |
|---|---|---|
| Distribution | Build + install per platform | URL — zero friction |
| Multiplayer infra | NGO + Unity Relay (cost, complexity) | Colyseus self-hosted (free, simple) |
| 3D graphics | Unity renderer | Three.js / R3F (WebGL, same capability for this scope) |
| CI/CD | Complex build pipeline | `git push` → auto-deploy |
| Licensing | Unity per-seat or runtime fee | Fully open-source stack |
| Reach | PC/console only | Any device with a browser |

The 3D cinematic vision from V2 is **fully achievable in the browser**. React Three Fiber gives us the same scene graph, PBR materials, postprocessing, and animation capabilities — in a component model that's far easier to maintain.

---

## Tech Stack

```
FRONTEND                           BACKEND
──────────────────────────────     ──────────────────────────────
Vite + React + TypeScript          Node.js + TypeScript
React Three Fiber (@react-three/fiber)  Colyseus (WebSocket room server)
@react-three/drei (helpers)        @colyseus/schema (state sync)
@react-three/postprocessing        Colyseus Monitor (admin UI)
Three.js (underlying WebGL)
Zustand (local UI state)           SHARED
GSAP (animations + cinematics)     shared/types.ts (enums, interfaces)
Framer Motion (UI transitions)     shared/cards.ts  (card definitions)
colyseus.js (client SDK)           shared/map.ts    (node graph)
Howler.js (spatial audio)

BUILD & DEPLOY
──────────────────────────────
pnpm workspaces (monorepo)
Turborepo (build pipeline)
Fly.io (Colyseus server — WebSocket friendly)
Vercel (React client — edge CDN)
```

---

## Project Structure

```
outer-rim-digital/
├── packages/
│   ├── shared/            ← TypeScript types used by both server + client
│   │   ├── src/
│   │   │   ├── types.ts        ← Enums, interfaces, constants
│   │   │   ├── cards.ts        ← All card definitions (JSON-like objects)
│   │   │   ├── characters.ts   ← Character + ship definitions
│   │   │   └── map.ts          ← Node graph definition
│   │   └── package.json
│   │
│   ├── server/            ← Colyseus game server
│   │   ├── src/
│   │   │   ├── index.ts              ← Server entry point
│   │   │   ├── rooms/
│   │   │   │   ├── GameRoom.ts       ← Room + message handlers
│   │   │   │   └── schema/
│   │   │   │       ├── GameState.ts  ← Colyseus root schema
│   │   │   │       ├── PlayerState.ts
│   │   │   │       └── CardSlot.ts
│   │   │   └── game/
│   │   │       ├── TurnMachine.ts    ← Phase state machine
│   │   │       ├── CombatResolver.ts
│   │   │       ├── SkillTestResolver.ts
│   │   │       ├── DeckManager.ts
│   │   │       ├── PatrolManager.ts
│   │   │       └── DataBankManager.ts
│   │   └── package.json
│   │
│   └── client/            ← React + R3F frontend
│       ├── src/
│       │   ├── main.tsx              ← App entry
│       │   ├── App.tsx               ← Route: Lobby | Game
│       │   ├── scenes/
│       │   │   ├── GalaxyMap.tsx     ← R3F main 3D scene
│       │   │   ├── nodes/
│       │   │   │   ├── PlanetNode.tsx
│       │   │   │   └── NavPointNode.tsx
│       │   │   ├── ships/
│       │   │   │   ├── PlayerShip.tsx
│       │   │   │   └── PatrolShip.tsx
│       │   │   └── fx/
│       │   │       ├── HyperspaceTravel.tsx
│       │   │       ├── HyperspaceLines.tsx
│       │   │       └── DiceRoll3D.tsx
│       │   ├── ui/
│       │   │   ├── Cockpit/
│       │   │   │   ├── Cockpit.tsx        ← Cockpit frame overlay
│       │   │   │   ├── NavSphere.tsx
│       │   │   │   ├── Viewport.tsx
│       │   │   │   └── HUD.tsx
│       │   │   ├── Terminal/
│       │   │   │   ├── Terminal.tsx
│       │   │   │   ├── tabs/
│       │   │   │   │   ├── NavigationTab.tsx
│       │   │   │   │   ├── MarketTab.tsx
│       │   │   │   │   ├── CargoTab.tsx
│       │   │   │   │   └── CrewTab.tsx
│       │   │   └── overlays/
│       │   │       ├── CombatOverlay.tsx
│       │   │       ├── ContactReveal.tsx
│       │   │       └── JobSequence.tsx
│       │   ├── stores/
│       │   │   └── gameStore.ts           ← Zustand client store
│       │   ├── hooks/
│       │   │   ├── useGameRoom.ts         ← Colyseus connection
│       │   │   ├── useCinematic.ts        ← GSAP animation triggers
│       │   │   └── useAudio.ts            ← Howler.js spatial audio
│       │   └── lib/
│       │       └── colyseusClient.ts      ← Room client singleton
│       └── package.json
│
├── pnpm-workspace.yaml
├── turbo.json
└── fly.toml                ← Colyseus deploy config
```

---

## Shared Types

```typescript
// packages/shared/src/types.ts

export const FAME_REQUIREMENT_DEFAULT = 10;
export const CREDITS_FROM_RESTING    = 2000;
export const DEFEAT_CREDIT_PENALTY   = 3000;

// ─── GAME PHASES ─────────────────────────────────────────────────────────────
export type GamePhase =
  | 'WAITING_FOR_PLAYERS'
  | 'PLANNING'
  | 'ACTION'
  | 'ENCOUNTER'
  | 'COMBAT'
  | 'WIN_CHECK'
  | 'GAME_OVER';

// ─── TURN CHOICES ─────────────────────────────────────────────────────────────
export type PlanningChoice = 'MOVE' | 'RECOVER' | 'GAIN_CREDITS';
export type EncounterChoice = 'FIGHT_PATROL' | 'SPACE_ENCOUNTER' | 'CONTACT' | 'CARD_ABILITY';

// ─── FACTIONS (correct names from rulebook) ──────────────────────────────────
export type FactionType = 'HUTT' | 'SYNDICATE' | 'IMPERIAL' | 'REBEL' | 'NONE';

// ─── REPUTATION — 3 discrete states only (Rules Ref p.17) ────────────────────
export type ReputationStatus = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export const REP_INT: Record<ReputationStatus, number> = { POSITIVE: 1, NEUTRAL: 0, NEGATIVE: -1 };
export function intToRep(n: number): ReputationStatus {
  if (n > 0) return 'POSITIVE';
  if (n < 0) return 'NEGATIVE';
  return 'NEUTRAL';
}

// ─── MARKET DECKS — 6 total; Gear+Mod are ONE combined deck ──────────────────
export type MarketDeckType = 'BOUNTY' | 'CARGO' | 'GEAR_MOD' | 'JOB' | 'LUXURY' | 'SHIP';

// ─── MAP NODES ────────────────────────────────────────────────────────────────
export type MapNodeType = 'PLANET' | 'NAVPOINT' | 'MAELSTROM';

// ─── SKILLS (from character/crew cards in rulebook) ──────────────────────────
export type SkillType =
  | 'INFLUENCE' | 'STRENGTH' | 'KNOWLEDGE'
  | 'TACTICS'   | 'PILOTING' | 'STEALTH' | 'TECH';

// ─── DICE ─────────────────────────────────────────────────────────────────────
// 8-sided die: 3×Hit, 1×Crit, 2×Focus, 2×Blank (Learn to Play p.16)
export type DieFace = 'HIT' | 'CRIT' | 'FOCUS' | 'BLANK';

export interface DiceResult {
  faces: DieFace[];
  totalDamage: number;  // Hit=1, Crit=2
  hitCount:  number;    // CRIT ≠ HIT for ability purposes
  critCount: number;
  focusCount: number;
  blankCount: number;
}

export type CombatType = 'GROUND' | 'SHIP';

// ─── CARDS ────────────────────────────────────────────────────────────────────
export interface CardDefinition {
  id: number;
  name: string;
  deckType: MarketDeckType;
  buyCost: number;
  sellValue: number;
  flavorText?: string;
  effectDescription: string;
  artUrl?: string;
  // Patrol movement icon on card back
  patrolMovementFaction?: FactionType;
  patrolMovementDistance?: number;
  // Unfinished Business: reveal contact icon
  revealContactPlayerCount?: [number, number]; // [min, max] player count range
}

export interface CargoCard extends CardDefinition {
  deckType: 'CARGO';
  destinationPlanetId: string;
  deliveryReward: number;
  isIllegal: boolean;
  cannotBuyOnPlanetId?: string;
}

export interface BountyCard extends CardDefinition {
  deckType: 'BOUNTY';
  targetName: string;
  targetContactClass: ContactClass;
  contactCombatValue: number;
  combatType: CombatType;
  eliminationReward: { credits: number; fame: number };
  captureReward: { credits: number; fame: number; planet: string };
  issuingFaction: FactionType;
}

export interface GearModCard extends CardDefinition {
  deckType: 'GEAR_MOD';
  isGear: boolean; // true = goes on player board; false = goes on ship sheet
  // Gear stats
  groundCombatBonus?: number;
  skillBonus?: { skill: SkillType; count: number }[];
  isSingleUse?: boolean;
  // Mod stats
  hyperdriveBonus?: number;
  hullBonus?: number;
  attackDiceBonus?: number;
  cargoSlotBonus?: number;
  crewSlotBonus?: number;
}

export interface JobCard extends CardDefinition {
  deckType: 'JOB';
  destinationPlanetId: string;
  dataBankCardNumber: number;
  skillsRequired: SkillType[];
  skillsCritical: SkillType[];  // Italic skills — failing them likely fails the job
  creditAdvance?: number;
  reward: { credits: number; fame: number };
  cannotBuyOnPlanetId?: string;
}

export type ContactClass = 'WHITE' | 'GREEN' | 'YELLOW' | 'ORANGE';

export interface ContactToken {
  id: number;
  dataBankCardNumber: number;
  contactClass: ContactClass;
  faceUp: boolean;
  planetId: string;
}

// ─── MAP ──────────────────────────────────────────────────────────────────────
export interface MapNode {
  id: number;
  name: string;
  planetId: string;         // Matches encounter deck keys
  type: MapNodeType;
  factionOwner: FactionType;
  connectedNodeIds: number[];
  contactSpaces: { class: ContactClass; pipCount: number }[];
  // 3D scene data
  position: [number, number, number];  // World position on galaxy arc
}

// ─── PATROL ───────────────────────────────────────────────────────────────────
export type PatrolLevel = 1 | 2 | 3 | 4;

export interface PatrolDefinition {
  faction: FactionType;
  level: PatrolLevel;
  combatValue: number;     // Level 4: Infinity (use Number.POSITIVE_INFINITY)
  creditReward: number;    // Level 1 only
  fameReward: number;      // Levels 2-3 only
}

// ─── CHARACTERS & SHIPS ───────────────────────────────────────────────────────
export interface CharacterDefinition {
  id: string;
  name: string;
  maxHealth: number;
  groundCombatValue: number;
  skills: SkillType[];
  gearSlots: number;
  jobBountySlots: number;
  startingDataBankCard: number; // 90, 91, or 92
  startingReputation?: { faction: FactionType; status: ReputationStatus };
  personalGoal: string;
  portraitUrl?: string;
}

export interface ShipDefinition {
  id: string;
  name: string;
  hyperdrive: number;
  maxHull: number;
  shipCombatValue: number;
  cargoSlots: number;
  crewSlots: number;
  modSlots: number;
  buyCost: number;
  shipGoal: string;
  modelUrl?: string;       // GLTF/GLB path
  cockpitTextureUrl?: string;
}

// ─── CLIENT ↔ SERVER MESSAGES ─────────────────────────────────────────────────
// Sent from client to server via Colyseus room.send()
export type ClientMessage =
  | { type: 'PLANNING_CHOICE';    payload: { choice: PlanningChoice } }
  | { type: 'CONFIRM_MOVE';       payload: { destinationNodeId: number } }
  | { type: 'END_ACTION_PHASE' }
  | { type: 'SUBMIT_ENCOUNTER';   payload: { choice: EncounterChoice; targetId?: number } }
  | { type: 'MARKET_DISCARD';     payload: { deckType: MarketDeckType } }
  | { type: 'MARKET_BUY';         payload: { deckType: MarketDeckType } }
  | { type: 'DELIVER_CARGO';      payload: { cardSlotIndex: number } }
  | { type: 'PATROL_MOVE_AFTER_LOSS'; payload: { faction: FactionType; destNodeId: number } }
  | { type: 'SELECT_CHARACTER';   payload: { characterId: string; shipId: string } };

// Sent from server to clients via room.broadcast() or client.send()
export type ServerEvent =
  | { event: 'PHASE_CHANGED';     data: { phase: GamePhase; activePlayerId: string } }
  | { event: 'CINEMATIC_TRIGGER'; data: { type: string; payload: Record<string, unknown> } }
  | { event: 'DICE_ROLLED';       data: { playerId: string; rolls: DiceResult[]; context: string } }
  | { event: 'ENCOUNTER_CARD';    data: { cardId: number; planetId: string } }
  | { event: 'CONTACT_REVEALED';  data: { contactId: number; dataBankCardNumber: number } }
  | { event: 'COMBAT_RESULT';     data: { winnerId: string; attackerDmg: number; defenderDmg: number } }
  | { event: 'PATROL_MOVED';      data: { faction: FactionType; fromNode: number; toNode: number } }
  | { event: 'GAME_OVER';         data: { winnerId: string; fame: number } };
```

---

## Server — Colyseus Schemas

```typescript
// packages/server/src/rooms/schema/PlayerState.ts
import { Schema, type, ArraySchema } from '@colyseus/schema';
import { ReputationStatus, SkillType } from '@outer-rim/shared';

export class CardSlot extends Schema {
  @type('number') cardDefinitionId: number = -1;
  @type('boolean') isOccupied: boolean = false;
  @type('boolean') isRotated: boolean = false; // Unfinished Business rotating assets
}

export class PlayerState extends Schema {
  @type('string') sessionId: string = '';
  @type('string') displayName: string = 'Scoundrel';
  @type('string') characterId: string = '';
  @type('string') shipId: string = '';
  @type('boolean') isReady: boolean = false;

  // Core resources
  @type('number') fame: number = 0;
  @type('number') credits: number = 0;

  // Damage — check against maxHealth/maxHull from CharacterDefinition/ShipDefinition
  @type('number') characterDamage: number = 0;
  @type('number') shipDamage: number = 0;

  // Location
  @type('number') currentNodeId: number = -1;

  // Reputation: -1 = Negative, 0 = Neutral, 1 = Positive
  @type('number') repHutt: number = 0;
  @type('number') repSyndicate: number = 0;
  @type('number') repImperial: number = 0;
  @type('number') repRebel: number = 0;

  // Inventory slots (size set from ship/character definition)
  @type([CardSlot]) cargoSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) crewSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) gearSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) modSlots = new ArraySchema<CardSlot>();
  @type([CardSlot]) jobBountySlots = new ArraySchema<CardSlot>();
}
```

```typescript
// packages/server/src/rooms/schema/GameState.ts
import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';
import { GamePhase, FactionType } from '@outer-rim/shared';
import { PlayerState } from './PlayerState';

export class GameState extends Schema {
  @type('string') phase: string = 'WAITING_FOR_PLAYERS';
  @type('number') currentPlayerIndex: number = 0;
  @type('number') turnNumber: number = 1;
  @type('number') fameRequirement: number = 10;

  // Turn order (session IDs in order)
  @type(['string']) turnOrder = new ArraySchema<string>();

  // Players
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();

  // Market — top card ID of each deck (revealed to all clients)
  @type('number') topBountyId:   number = -1;
  @type('number') topCargoId:    number = -1;
  @type('number') topGearModId:  number = -1;
  @type('number') topJobId:      number = -1;
  @type('number') topLuxuryId:   number = -1;
  @type('number') topShipId:     number = -1;

  // Patrol positions (node IDs)
  @type('number') huttPatrolNode:      number = -1;
  @type('number') syndicatePatrolNode: number = -1;
  @type('number') imperialPatrolNode:  number = -1;
  @type('number') rebelPatrolNode:     number = -1;

  // Patrol levels (the current level of each faction's active patrol)
  @type('number') huttPatrolLevel:      number = 1;
  @type('number') syndicatePatrolLevel: number = 1;
  @type('number') imperialPatrolLevel:  number = 1;
  @type('number') rebelPatrolLevel:     number = 1;
}
```

---

## Server — GameRoom

```typescript
// packages/server/src/rooms/GameRoom.ts
import { Room, Client } from 'colyseus';
import { GameState } from './schema/GameState';
import { PlayerState } from './schema/PlayerState';
import { TurnMachine } from '../game/TurnMachine';
import { DeckManager } from '../game/DeckManager';
import { PatrolManager } from '../game/PatrolManager';
import { ClientMessage, ServerEvent, PlanningChoice } from '@outer-rim/shared';

export class GameRoom extends Room<GameState> {
  private turnMachine!: TurnMachine;
  private deckManager!: DeckManager;
  private patrolManager!: PatrolManager;

  maxClients = 4;
  autoDispose = false; // Keep room alive if a player disconnects temporarily

  onCreate(options: { fameRequirement?: number }) {
    this.setState(new GameState());
    this.state.fameRequirement = options.fameRequirement ?? 10;

    this.deckManager   = new DeckManager(this.state);
    this.patrolManager = new PatrolManager(this.state);
    this.turnMachine   = new TurnMachine(this.state, this.deckManager, this.patrolManager, this);

    this.deckManager.initialize();
    this.patrolManager.initialize();

    this.registerMessageHandlers();
  }

  private registerMessageHandlers() {
    this.onMessage<ClientMessage>('PLANNING_CHOICE', (client, msg) => {
      if (msg.type !== 'PLANNING_CHOICE') return;
      this.turnMachine.handlePlanningChoice(client.sessionId, msg.payload.choice);
    });

    this.onMessage<ClientMessage>('CONFIRM_MOVE', (client, msg) => {
      if (msg.type !== 'CONFIRM_MOVE') return;
      this.turnMachine.handleConfirmMove(client.sessionId, msg.payload.destinationNodeId);
    });

    this.onMessage<ClientMessage>('END_ACTION_PHASE', (client) => {
      this.turnMachine.handleEndActionPhase(client.sessionId);
    });

    this.onMessage<ClientMessage>('SUBMIT_ENCOUNTER', (client, msg) => {
      if (msg.type !== 'SUBMIT_ENCOUNTER') return;
      this.turnMachine.handleEncounterChoice(client.sessionId, msg.payload);
    });

    this.onMessage<ClientMessage>('MARKET_DISCARD', (client, msg) => {
      if (msg.type !== 'MARKET_DISCARD') return;
      this.deckManager.handleDiscard(client.sessionId, msg.payload.deckType);
    });

    this.onMessage<ClientMessage>('MARKET_BUY', (client, msg) => {
      if (msg.type !== 'MARKET_BUY') return;
      this.deckManager.handleBuy(client.sessionId, msg.payload.deckType);
    });

    this.onMessage<ClientMessage>('PATROL_MOVE_AFTER_LOSS', (client, msg) => {
      if (msg.type !== 'PATROL_MOVE_AFTER_LOSS') return;
      this.patrolManager.handlePlayerMovePatrol(
        client.sessionId,
        msg.payload.faction,
        msg.payload.destNodeId
      );
    });

    this.onMessage<ClientMessage>('SELECT_CHARACTER', (client, msg) => {
      if (msg.type !== 'SELECT_CHARACTER') return;
      this.handleCharacterSelection(client, msg.payload);
    });
  }

  // ─── PLAYER JOIN / LEAVE ────────────────────────────────────────────────────

  onJoin(client: Client, options: { displayName?: string }) {
    const ps = new PlayerState();
    ps.sessionId   = client.sessionId;
    ps.displayName = options.displayName ?? `Player ${this.clients.length}`;
    this.state.players.set(client.sessionId, ps);

    // 4-player credit stagger: 4k, 6k, 8k, 10k (by join order, set properly during char selection)
    console.log(`[GameRoom] ${ps.displayName} joined. Players: ${this.clients.length}`);
  }

  onLeave(client: Client, consented: boolean) {
    // Give player 30 seconds to reconnect before removing
    if (!consented) {
      this.allowReconnection(client, 30).then(() => {
        console.log(`[GameRoom] ${client.sessionId} reconnected.`);
      }).catch(() => {
        this.state.players.delete(client.sessionId);
        // Remove from turn order
        const idx = this.state.turnOrder.indexOf(client.sessionId);
        if (idx > -1) this.state.turnOrder.splice(idx, 1);
        console.log(`[GameRoom] ${client.sessionId} removed after timeout.`);
      });
    }
  }

  // ─── GAME START ─────────────────────────────────────────────────────────────

  private handleCharacterSelection(
    client: Client,
    payload: { characterId: string; shipId: string }
  ) {
    const ps = this.state.players.get(client.sessionId);
    if (!ps) return;

    ps.characterId = payload.characterId;
    ps.shipId      = payload.shipId;
    ps.isReady     = true;

    const allReady = Array.from(this.state.players.values()).every(p => p.isReady);
    if (allReady && this.clients.length >= 2) {
      this.turnMachine.startGame();
    }
  }

  // ─── BROADCAST HELPER ───────────────────────────────────────────────────────

  broadcastEvent(event: ServerEvent) {
    this.broadcast('SERVER_EVENT', event);
  }

  sendToClient(sessionId: string, event: ServerEvent) {
    const client = this.clients.find(c => c.sessionId === sessionId);
    client?.send('SERVER_EVENT', event);
  }
}
```

---

## Server — TurnMachine

```typescript
// packages/server/src/game/TurnMachine.ts
// The authoritative turn state machine — translates to TypeScript
// what GameManager.cs was in the Unity version.

import { GameState } from '../rooms/schema/GameState';
import { DeckManager } from './DeckManager';
import { PatrolManager } from './PatrolManager';
import { CombatResolver } from './CombatResolver';
import { MapManager } from './MapManager';
import {
  GamePhase, PlanningChoice, EncounterChoice,
  CREDITS_FROM_RESTING, DEFEAT_CREDIT_PENALTY,
  intToRep
} from '@outer-rim/shared';
import type { GameRoom } from '../rooms/GameRoom';

export class TurnMachine {
  private combatResolver: CombatResolver;
  private planningResolved = false;
  private pendingPatrolMove = false;

  constructor(
    private state: GameState,
    private deckManager: DeckManager,
    private patrolManager: PatrolManager,
    private room: GameRoom
  ) {
    this.combatResolver = new CombatResolver();
  }

  // ─── START ────────────────────────────────────────────────────────────────

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
    this.state.turnOrder.forEach((id, i) => {
      const ps = this.state.players.get(id);
      if (ps) ps.credits = startCredits[Math.min(i, startCredits.length - 1)];
    });

    this.transitionTo('PLANNING');
  }

  // ─── PHASE TRANSITIONS ────────────────────────────────────────────────────

  private transitionTo(phase: GamePhase) {
    this.planningResolved = false;
    this.state.phase = phase;

    const activeId = this.getActivePlayerId();
    this.room.broadcastEvent({ event: 'PHASE_CHANGED', data: { phase, activePlayerId: activeId } });

    if (phase === 'ENCOUNTER') {
      // Check if patrol encounter is forced
      const mandatory = this.patrolManager.getMandatoryPatrolFaction(activeId);
      if (mandatory) {
        // Tell client they must fight this patrol
        this.room.sendToClient(activeId, {
          event: 'CINEMATIC_TRIGGER',
          data: { type: 'FORCED_PATROL', payload: { faction: mandatory } }
        });
      }
    }

    if (phase === 'WIN_CHECK') this.checkWinCondition();
  }

  // ─── PLANNING PHASE ───────────────────────────────────────────────────────

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
        // Server sends event telling client to show movement UI
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
        // Wait for CONFIRM_MOVE message
        break;
    }
  }

  handleConfirmMove(sessionId: string, destNodeId: number) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'PLANNING' || !this.planningResolved) return;

    const ps = this.state.players.get(sessionId)!;
    const path = MapManager.findPath(
      ps.currentNodeId, destNodeId, this.getEffectiveHyperdrive(sessionId)
    );
    if (!path) return;

    ps.currentNodeId = destNodeId;

    this.room.broadcastEvent({
      event: 'CINEMATIC_TRIGGER',
      data: { type: 'HYPERSPACE_TRAVEL', payload: { sessionId, path } }
    });

    // Delay to allow animation, then proceed
    setTimeout(() => this.transitionTo('ACTION'), 3000);
  }

  // ─── ACTION PHASE ─────────────────────────────────────────────────────────

  handleEndActionPhase(sessionId: string) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'ACTION') return;
    this.transitionTo('ENCOUNTER');
  }

  // ─── ENCOUNTER PHASE ──────────────────────────────────────────────────────

  handleEncounterChoice(
    sessionId: string,
    payload: { choice: EncounterChoice; targetId?: number }
  ) {
    if (!this.validateActivePlayer(sessionId)) return;
    if (this.state.phase !== 'ENCOUNTER') return;

    // RULES: If negative-rep patrol is in same space, MUST fight it
    const mandatory = this.patrolManager.getMandatoryPatrolFaction(sessionId);
    if (mandatory && payload.choice !== 'FIGHT_PATROL') return;

    switch (payload.choice) {
      case 'FIGHT_PATROL':
        this.handlePatrolCombat(sessionId, mandatory!);
        break;
      case 'SPACE_ENCOUNTER':
        this.handleSpaceEncounter(sessionId);
        break;
      case 'CONTACT':
        if (payload.targetId != null) this.handleContactEncounter(sessionId, payload.targetId);
        break;
    }
  }

  private handlePatrolCombat(sessionId: string, faction: import('@outer-rim/shared').FactionType) {
    this.state.phase = 'COMBAT';
    const ps = this.state.players.get(sessionId)!;
    const patrol = this.patrolManager.getPatrol(faction);

    // RULES: Level-4 patrol — no dice, instant defeat
    if (patrol.level === 4) {
      ps.shipDamage = this.getShipMaxHull(sessionId); // Instant defeat
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

    // RULES: Both sides suffer opponent's damage
    ps.shipDamage = Math.min(ps.shipDamage + patrolRoll.totalDamage, this.getShipMaxHull(sessionId));

    const playerWins = playerRoll.totalDamage >= patrolRoll.totalDamage;

    if (playerWins) {
      // RULES: Gain reward, LOSE 1 rep with faction, eliminate, spawn new
      ps.credits += patrol.creditReward;
      ps.fame    += patrol.fameReward;
      this.modifyRep(ps, faction, -1); // LOSE 1 rep
      this.patrolManager.eliminateAndSpawn(faction);
    } else {
      // RULES: Player moves patrol 1 space (prompted via client)
      this.pendingPatrolMove = true;
      this.room.sendToClient(sessionId, {
        event: 'CINEMATIC_TRIGGER',
        data: { type: 'PROMPT_PATROL_MOVE', payload: { faction } }
      });
    }

    if (ps.shipDamage >= this.getShipMaxHull(sessionId)) this.applyDefeatPenalty(ps);

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

    if (!this.pendingPatrolMove) {
      setTimeout(() => this.transitionTo('WIN_CHECK'), 4000);
    }
  }

  private handleSpaceEncounter(sessionId: string) {
    // Draw encounter card for current node — trigger cinematic
    const ps = this.state.players.get(sessionId)!;
    // TODO: Pull from EncounterDeckManager
    this.room.broadcastEvent({
      event: 'CINEMATIC_TRIGGER',
      data: { type: 'SPACE_ENCOUNTER', payload: { sessionId, nodeId: ps.currentNodeId } }
    });
    // EncounterResolver handles resolution, calls completeEncounter() when done
  }

  private handleContactEncounter(sessionId: string, contactId: number) {
    this.room.broadcastEvent({
      event: 'CONTACT_REVEALED',
      data: { contactId, dataBankCardNumber: contactId } // TODO: proper lookup
    });
  }

  completeEncounter() {
    this.transitionTo('WIN_CHECK');
  }

  // ─── WIN CONDITION ────────────────────────────────────────────────────────

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
    if (next === 0) this.state.turnNumber++;
    this.state.currentPlayerIndex = next;
    this.transitionTo('PLANNING');
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  getActivePlayerId(): string {
    return this.state.turnOrder[this.state.currentPlayerIndex] ?? '';
  }

  private validateActivePlayer(sessionId: string): boolean {
    return this.getActivePlayerId() === sessionId;
  }

  private isPlayerDefeated(ps: ReturnType<typeof this.state.players.get>): boolean {
    if (!ps) return false;
    // Would need CharacterDefinition and ShipDefinition to get max values
    // TODO: load from shared character/ship data
    return false; // Placeholder — compare ps.characterDamage vs maxHealth
  }

  private applyDefeatPenalty(ps: NonNullable<ReturnType<typeof this.state.players.get>>) {
    ps.credits = Math.max(0, ps.credits - DEFEAT_CREDIT_PENALTY);
    // TODO: discard secrets
  }

  private getEffectiveHyperdrive(sessionId: string): number {
    const ps = this.state.players.get(sessionId);
    if (!ps) return 1;
    // TODO: sum mod bonuses from ps.modSlots
    return 4; // Default until ship data integrated
  }

  private getShipCombatValue(sessionId: string): number {
    const ps = this.state.players.get(sessionId);
    if (!ps) return 1;
    return 3; // Default — TODO: from ShipDefinition + mod bonuses
  }

  private getShipMaxHull(sessionId: string): number {
    return 6; // Default — TODO: from ShipDefinition + mod bonuses
  }

  private modifyRep(
    ps: NonNullable<ReturnType<typeof this.state.players.get>>,
    faction: import('@outer-rim/shared').FactionType,
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
```

---

## Server — CombatResolver

```typescript
// packages/server/src/game/CombatResolver.ts
// CORRECTED combat per Living Rules Reference p.6:
//   Both roll dice equal to combat value.
//   Hit = 1 dmg, Crit = 2 dmg. BOTH take damage.
//   Higher damage wins; attacker wins ties.

import { DieFace, DiceResult } from '@outer-rim/shared';

const DIE_FACES: DieFace[] = [
  'HIT', 'HIT', 'HIT',   // 3 sides
  'CRIT',                  // 1 side
  'FOCUS', 'FOCUS',       // 2 sides
  'BLANK', 'BLANK'        // 2 sides
];

export class CombatResolver {
  static rollDice(numDice: number): DiceResult {
    const count = Math.max(1, numDice);
    const faces: DieFace[] = Array.from({ length: count }, () =>
      DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)]
    );

    return {
      faces,
      totalDamage: faces.reduce((sum, f) => sum + (f === 'HIT' ? 1 : f === 'CRIT' ? 2 : 0), 0),
      hitCount:   faces.filter(f => f === 'HIT').length,
      critCount:  faces.filter(f => f === 'CRIT').length,
      focusCount: faces.filter(f => f === 'FOCUS').length,
      blankCount: faces.filter(f => f === 'BLANK').length,
    };
  }

  // Skill test: ALWAYS 2 dice (Rules Ref p.18)
  // skillCount: 0 = Unskilled, 1 = Skilled, 2+ = Highly Skilled
  static resolveSkillTest(skillCount: number): { passed: boolean; roll: DiceResult } {
    const roll = this.rollDice(2);
    const passed =
      skillCount === 0 ? roll.critCount >= 1 :
      skillCount === 1 ? roll.critCount >= 1 || roll.hitCount >= 1 :
      /* 2+ */           roll.critCount >= 1 || roll.hitCount >= 1 || roll.focusCount >= 1;
    return { passed, roll };
  }
}
```

---

## Client — Colyseus Connection

```typescript
// packages/client/src/hooks/useGameRoom.ts
import { useEffect, useRef, useCallback } from 'react';
import { Client, Room } from 'colyseus.js';
import { GameState } from '../../../server/src/rooms/schema/GameState';
import { useGameStore } from '../stores/gameStore';
import type { ClientMessage, ServerEvent } from '@outer-rim/shared';

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'ws://localhost:2567';
const colyseusClient = new Client(SERVER_URL);

export function useGameRoom() {
  const roomRef = useRef<Room<GameState> | null>(null);
  const { applyStateUpdate, handleServerEvent, setConnectionStatus } = useGameStore();

  const connect = useCallback(async (roomCode?: string, options?: object) => {
    try {
      setConnectionStatus('connecting');
      const room: Room<GameState> = roomCode
        ? await colyseusClient.joinById<GameState>(roomCode, options)
        : await colyseusClient.create<GameState>('game_room', options);

      roomRef.current = room;

      // State changes from Colyseus schemas flow into Zustand store
      room.onStateChange((state) => applyStateUpdate(state));

      // Directed server events (cinematics, dice results, etc.)
      room.onMessage<ServerEvent>('SERVER_EVENT', (event) => handleServerEvent(event));

      room.onLeave(() => setConnectionStatus('disconnected'));

      setConnectionStatus('connected');
      return room.roomId;
    } catch (err) {
      setConnectionStatus('error');
      throw err;
    }
  }, [applyStateUpdate, handleServerEvent, setConnectionStatus]);

  const send = useCallback((msg: ClientMessage) => {
    roomRef.current?.send(msg.type, 'payload' in msg ? msg.payload : undefined);
  }, []);

  useEffect(() => () => { roomRef.current?.leave(); }, []);

  return { connect, send, roomId: roomRef.current?.roomId };
}
```

```typescript
// packages/client/src/stores/gameStore.ts
import { create } from 'zustand';
import type { GameState } from '../../../server/src/rooms/schema/GameState';
import type {
  ServerEvent, GamePhase, FactionType,
  ClientMessage, CombatType
} from '@outer-rim/shared';

interface CinematicState {
  active: boolean;
  type: string;
  payload: Record<string, unknown>;
}

interface GameStore {
  // Mirror of Colyseus server state (updated via onStateChange)
  phase: GamePhase;
  activePlayerId: string;
  turnNumber: number;
  fameRequirement: number;
  players: Map<string, {
    displayName: string;
    characterId: string;
    shipId: string;
    fame: number;
    credits: number;
    charDamage: number;
    shipDamage: number;
    currentNodeId: number;
    rep: Record<FactionType, number>;
  }>;
  marketTopCards: Record<string, number>; // deckType → cardId
  patrolNodes: Record<FactionType, number>;

  // Local UI state
  mySessionId: string;
  activeTab: string;
  planningChoice: string | null;
  cinematic: CinematicState;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  // Actions
  applyStateUpdate: (state: GameState) => void;
  handleServerEvent: (event: ServerEvent) => void;
  setActiveTab: (tab: string) => void;
  setPlanningChoice: (choice: string | null) => void;
  setConnectionStatus: (status: GameStore['connectionStatus']) => void;
  setMySessionId: (id: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'WAITING_FOR_PLAYERS',
  activePlayerId: '',
  turnNumber: 1,
  fameRequirement: 10,
  players: new Map(),
  marketTopCards: {},
  patrolNodes: {} as Record<FactionType, number>,

  mySessionId: '',
  activeTab: 'nav',
  planningChoice: null,
  cinematic: { active: false, type: '', payload: {} },
  connectionStatus: 'disconnected',

  applyStateUpdate: (state) => set({
    phase: state.phase as GamePhase,
    activePlayerId: state.turnOrder[state.currentPlayerIndex] ?? '',
    turnNumber: state.turnNumber,
    fameRequirement: state.fameRequirement,
    marketTopCards: {
      BOUNTY:   state.topBountyId,
      CARGO:    state.topCargoId,
      GEAR_MOD: state.topGearModId,
      JOB:      state.topJobId,
      LUXURY:   state.topLuxuryId,
      SHIP:     state.topShipId,
    },
    patrolNodes: {
      HUTT:      state.huttPatrolNode,
      SYNDICATE: state.syndicatePatrolNode,
      IMPERIAL:  state.imperialPatrolNode,
      REBEL:     state.rebelPatrolNode,
      NONE:      -1,
    },
  }),

  handleServerEvent: (event) => {
    if (event.event === 'PHASE_CHANGED') {
      set({ phase: event.data.phase, activePlayerId: event.data.activePlayerId });
    }
    if (event.event === 'CINEMATIC_TRIGGER') {
      set({ cinematic: { active: true, type: event.data.type, payload: event.data.payload } });
    }
    if (event.event === 'GAME_OVER') {
      set({ phase: 'GAME_OVER' });
    }
  },

  setActiveTab:     (tab) => set({ activeTab: tab }),
  setPlanningChoice: (c)  => set({ planningChoice: c }),
  setConnectionStatus: (s) => set({ connectionStatus: s }),
  setMySessionId:   (id)  => set({ mySessionId: id }),
}));
```

---

## Client — Galaxy Scene (React Three Fiber)

```tsx
// packages/client/src/scenes/GalaxyMap.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Float, Trail, Html } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { Vector2 } from 'three';
import { useGameStore } from '../stores/gameStore';
import { MAP_NODES } from '@outer-rim/shared/map';
import PlanetNode from './nodes/PlanetNode';
import NavPointNode from './nodes/NavPointNode';
import PlayerShip from './ships/PlayerShip';
import PatrolShip from './ships/PatrolShip';
import HyperspaceLines from './fx/HyperspaceLines';

export default function GalaxyMap() {
  return (
    // Canvas fills the full background; the cockpit overlay sits on top (absolute positioned)
    <Canvas
      camera={{ position: [0, 18, 8], fov: 55 }}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 30, 0]} intensity={0.6} color="#4488cc" />

      {/* Space background */}
      <Stars radius={400} depth={80} count={18000} factor={7} fade />

      {/* Hyperspace lane connections */}
      <HyperspaceLines nodes={MAP_NODES} />

      {/* Map nodes */}
      {MAP_NODES.map(node =>
        node.type === 'PLANET'
          ? <PlanetNode key={node.id} node={node} />
          : node.type === 'NAVPOINT'
          ? <NavPointNode key={node.id} node={node} />
          : null
      )}

      {/* Player ships */}
      <PlayerShips />

      {/* Patrol ships */}
      <PatrolShips />

      {/* Camera controls — orbit only when NOT animating */}
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.85} luminanceSmoothing={0.9} />
        <ChromaticAberration offset={new Vector2(0.0005, 0.0005)} />
      </EffectComposer>
    </Canvas>
  );
}

function PlayerShips() {
  const { players, mySessionId } = useGameStore();
  return (
    <>
      {Array.from(players.entries()).map(([id, ps]) => (
        <PlayerShip key={id} sessionId={id} playerData={ps} isLocalPlayer={id === mySessionId} />
      ))}
    </>
  );
}

function PatrolShips() {
  const { patrolNodes } = useGameStore();
  const factions = ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'] as const;
  return (
    <>
      {factions.map(f => (
        <PatrolShip key={f} faction={f} nodeId={patrolNodes[f] ?? -1} />
      ))}
    </>
  );
}
```

---

## Deployment

```yaml
# fly.toml — Colyseus server on Fly.io
app = "outer-rim-server"
primary_region = "lhr"  # London — low latency for EU players

[build]
  dockerfile = "packages/server/Dockerfile"

[http_service]
  internal_port = 2567
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0  # Scale to zero when no games running

[[vm]]
  memory = "512mb"
  cpu_kind = "shared"
  cpus = 1
```

```dockerfile
# packages/server/Dockerfile
FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared ./packages/shared
COPY packages/server ./packages/server
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @outer-rim/shared build
RUN pnpm --filter @outer-rim/server build
EXPOSE 2567
CMD ["node", "packages/server/dist/index.js"]
```

**Client:** Push to GitHub → Vercel auto-deploys. Set `VITE_SERVER_URL=wss://outer-rim-server.fly.dev`.

---

## Updated Implementation Roadmap

### Sprint 1 — Monorepo & Server Core (Weeks 1–3)
- [ ] pnpm workspace setup with Turborepo
- [ ] `shared` package: all TypeScript types, enums, map data, card data
- [ ] Colyseus server with `GameRoom`, `GameState`, `PlayerState` schemas
- [ ] `TurnMachine` — full Planning/Action/Encounter/WinCheck loop
- [ ] `CombatResolver` — correct dice distribution + both-sides-take-damage
- [ ] `DeckManager` — 6 decks, cycle/buy flow, patrol icon trigger
- [ ] `PatrolManager` — 4 factions, move/spawn/eliminate
- [ ] Server tests with Jest (turn flow, combat math, skill tests)

### Sprint 2 — Client Foundation (Weeks 4–6)
- [ ] Vite + React + TypeScript + R3F project setup
- [ ] Zustand store + Colyseus connection hook
- [ ] Static galaxy map in R3F (all nodes positioned correctly)
- [ ] Hyperspace lane line geometry
- [ ] Basic planet sphere meshes (placeholder materials)
- [ ] Player ship spawning (placeholder cube geometry)
- [ ] Patrol ships with idle orbit animation

### Sprint 3 — Cockpit Interface (Weeks 7–9)
- [ ] Cockpit frame overlay (ship-specific texture per ship ID)
- [ ] Animated canvas starfield in viewport
- [ ] Nav sphere with map nodes + path highlighting
- [ ] Terminal with 5 tabs: Navigation, Market, Cargo, Crew, Status
- [ ] Planning tab — 3 choices, confirm flow
- [ ] Market tab — 6 deck top cards, cycle/buy buttons
- [ ] Reputation HUD (3-state per faction, faction colors)
- [ ] Fame bar + credits display

### Sprint 4 — Cinematics Layer (Weeks 10–13)
- [ ] GSAP-driven camera animation system
- [ ] Hyperspace travel sequence (stars elongate, tunnel, emergence)
- [ ] Space combat cinematic (dice as 3D objects, hit effects)
- [ ] Planet approach sequence (per planet)
- [ ] Contact reveal sequence
- [ ] Defeat/recover sequence

### Sprint 5 — Content & Polish (Weeks 14–17)
- [ ] All 8 character definitions + portraits
- [ ] All 12 ship definitions + 3D models (GLB)
- [ ] All 70 base market cards
- [ ] All encounter decks (7 planet decks)
- [ ] All 53 databank cards
- [ ] Per-planet environments (shaders, atmosphere, ambient audio)
- [ ] Faction music themes (Howler.js, Web Audio API)

### Sprint 6 — Launch (Weeks 18–20)
- [ ] Fly.io deployment + WebSocket SSL
- [ ] Vercel deployment + CDN
- [ ] Session sharing (room code / link)
- [ ] Mobile-responsive cockpit layout
- [ ] Performance pass (texture compression, LOD)

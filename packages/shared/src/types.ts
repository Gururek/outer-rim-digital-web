// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
export const FAME_REQUIREMENT_DEFAULT = 10;
export const CREDITS_FROM_RESTING = 2000;
export const DEFEAT_CREDIT_PENALTY = 3000;

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
export type EncounterChoice = 'FIGHT_PATROL' | 'SPACE_ENCOUNTER' | 'CONTACT' | 'ATTEMPT_JOB' | 'ATTEMPT_BOUNTY' | 'CARD_ABILITY';

// ─── FACTIONS ─────────────────────────────────────────────────────────────────
export type FactionType = 'HUTT' | 'SYNDICATE' | 'IMPERIAL' | 'REBEL' | 'NONE';

// ─── REPUTATION — 3 discrete states only ─────────────────────────────────────
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

// ─── SKILLS ───────────────────────────────────────────────────────────────────
export type SkillType =
  | 'INFLUENCE' | 'STRENGTH' | 'KNOWLEDGE'
  | 'TACTICS' | 'PILOTING' | 'STEALTH' | 'TECH';

// ─── DICE ─────────────────────────────────────────────────────────────────────
export type DieFace = 'HIT' | 'CRIT' | 'FOCUS' | 'BLANK';

export interface DiceResult {
  faces: DieFace[];
  totalDamage: number;
  hitCount: number;
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
  patrolMovementFaction?: FactionType;
  patrolMovementDistance?: number;
  revealContactPlayerCount?: [number, number];
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
  isGear: boolean;
  groundCombatBonus?: number;
  skillBonus?: { skill: SkillType; count: number }[];
  isSingleUse?: boolean;
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
  skillsCritical: SkillType[];
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
  planetId: string;
  type: MapNodeType;
  factionOwner: FactionType;
  connectedNodeIds: number[];
  contactSpaces: { class: ContactClass; pipCount: number }[];
  position: [number, number, number];
}

// ─── PATROL ───────────────────────────────────────────────────────────────────
export type PatrolLevel = 1 | 2 | 3 | 4;

export interface PatrolDefinition {
  faction: FactionType;
  level: PatrolLevel;
  combatValue: number;
  creditReward: number;
  fameReward: number;
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
  startingDataBankCard: number;
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
  modelUrl?: string;
  cockpitTextureUrl?: string;
}

// ─── CLIENT ↔ SERVER MESSAGES ─────────────────────────────────────────────────
export type ClientMessage =
  | { type: 'PLANNING_CHOICE'; payload: { choice: PlanningChoice } }
  | { type: 'CONFIRM_MOVE'; payload: { destinationNodeId: number } }
  | { type: 'END_ACTION_PHASE' }
  | { type: 'SUBMIT_ENCOUNTER'; payload: { choice: EncounterChoice; targetId?: number } }
  | { type: 'MARKET_DISCARD'; payload: { deckType: MarketDeckType } }
  | { type: 'MARKET_BUY'; payload: { deckType: MarketDeckType } }
  | { type: 'DELIVER_CARGO'; payload: { cardSlotIndex: number } }
  | { type: 'PATROL_MOVE_AFTER_LOSS'; payload: { faction: FactionType; destNodeId: number } }
  | { type: 'SELECT_CHARACTER'; payload: { characterId: string; shipId: string } };

export type ServerEvent =
  | { event: 'PHASE_CHANGED'; data: { phase: GamePhase; activePlayerId: string } }
  | { event: 'CINEMATIC_TRIGGER'; data: { type: string; payload: Record<string, unknown> } }
  | { event: 'DICE_ROLLED'; data: { playerId: string; rolls: DiceResult[]; context: string } }
  | { event: 'ENCOUNTER_CARD'; data: { cardId: number; planetId: string } }
  | { event: 'CONTACT_REVEALED'; data: { contactId: number; dataBankCardNumber: number } }
  | { event: 'COMBAT_RESULT'; data: { winnerId: string; attackerDmg: number; defenderDmg: number } }
  | { event: 'PATROL_MOVED'; data: { faction: FactionType; fromNode: number; toNode: number } }
  | { event: 'GAME_OVER'; data: { winnerId: string; fame: number } };

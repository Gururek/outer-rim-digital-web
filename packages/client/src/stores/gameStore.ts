import { create } from 'zustand';
import type { GamePhase, FactionType, ServerEvent } from '@outer-rim/shared';

export interface PlayerData {
  displayName: string;
  characterId: string;
  shipId: string;
  fame: number;
  credits: number;
  characterDamage: number;
  shipDamage: number;
  currentNodeId: number;
  actionsRemaining: number;
  rep: Record<FactionType, number>;
  // Inventory slots — arrays of card IDs
  cargoSlots: number[];
  crewSlots: number[];
  gearSlots: number[];
  modSlots: number[];
  jobBountySlots: number[];
}

interface CinematicState {
  active: boolean;
  type: string;
  payload: Record<string, unknown>;
}

interface GameStore {
  // Mirror of Colyseus server state
  phase: GamePhase;
  activePlayerId: string;
  turnNumber: number;
  fameRequirement: number;
  players: Map<string, PlayerData>;
  playerCount: number;
  marketTopCards: Record<string, number>;
  patrolNodes: Record<FactionType, number>;

  // Local UI state
  mySessionId: string;
  activeTab: string;
  planningChoice: string | null;
  cinematic: CinematicState;
  gameOver: { winnerId: string; winnerName: string; winnerFame: number };
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  moveHighlight: { hyperdrive: number; startNodeId: number } | null;

  // Actions
  applyStateUpdate: (state: any) => void;
  handleServerEvent: (event: ServerEvent) => void;
  setActiveTab: (tab: string) => void;
  setPlanningChoice: (choice: string | null) => void;
  setConnectionStatus: (status: GameStore['connectionStatus']) => void;
  setMySessionId: (id: string) => void;
  dismissCinematic: () => void;
}

function mapPlayerState(ps: any): PlayerData {
  // Extract card IDs from CardSlot arrays
  const extractCards = (slots: any[] | undefined): number[] =>
    (slots ?? []).filter((s: any) => s.isOccupied).map((s: any) => s.cardDefinitionId);

  return {
    displayName: ps.displayName ?? 'Unknown',
    characterId: ps.characterId ?? '',
    shipId: ps.shipId ?? '',
    fame: ps.fame ?? 0,
    credits: ps.credits ?? 0,
    characterDamage: ps.characterDamage ?? 0,
    shipDamage: ps.shipDamage ?? 0,
    currentNodeId: ps.currentNodeId ?? -1,
    actionsRemaining: ps.actionsRemaining ?? 2,
    rep: {
      HUTT: ps.repHutt ?? 0,
      SYNDICATE: ps.repSyndicate ?? 0,
      IMPERIAL: ps.repImperial ?? 0,
      REBEL: ps.repRebel ?? 0,
      NONE: 0,
    },
    cargoSlots: extractCards(ps.cargoSlots),
    crewSlots: extractCards(ps.crewSlots),
    gearSlots: extractCards(ps.gearSlots),
    modSlots: extractCards(ps.modSlots),
    jobBountySlots: extractCards(ps.jobBountySlots),
  };
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'WAITING_FOR_PLAYERS',
  activePlayerId: '',
  turnNumber: 1,
  fameRequirement: 10,
  players: new Map(),
  playerCount: 0,
  marketTopCards: {},
  patrolNodes: {} as Record<FactionType, number>,

  mySessionId: '',
  activeTab: 'nav',
  planningChoice: null,
  cinematic: { active: false, type: '', payload: {} },
  gameOver: { winnerId: '', winnerName: '', winnerFame: 0 },
  connectionStatus: 'disconnected',
  moveHighlight: null,

  applyStateUpdate: (state) => {
    // Extract players from Colyseus MapSchema
    const newPlayers = new Map<string, PlayerData>();
    if (state.players) {
      // MapSchema iterates with forEach((value, key) => ...)
      if (typeof state.players.forEach === 'function') {
        state.players.forEach((ps: any, sessionId: string) => {
          newPlayers.set(sessionId, mapPlayerState(ps));
        });
      } else if (state.players.entries) {
        // Fallback for standard Map/object
        for (const [sessionId, ps] of Object.entries(state.players)) {
          newPlayers.set(sessionId, mapPlayerState(ps));
        }
      }
    }

    const count = newPlayers.size;

    set({
      phase: state.phase as GamePhase,
      activePlayerId: state.turnOrder[state.currentPlayerIndex] ?? '',
      turnNumber: state.turnNumber,
      fameRequirement: state.fameRequirement,
      playerCount: count,
      players: newPlayers,
      marketTopCards: {
        BOUNTY: state.topBountyId,
        CARGO: state.topCargoId,
        GEAR_MOD: state.topGearModId,
        JOB: state.topJobId,
        LUXURY: state.topLuxuryId,
        SHIP: state.topShipId,
      },
      patrolNodes: {
        HUTT: state.huttPatrolNode,
        SYNDICATE: state.syndicatePatrolNode,
        IMPERIAL: state.imperialPatrolNode,
        REBEL: state.rebelPatrolNode,
        NONE: -1,
      },
    });
  },

  handleServerEvent: (event) => {
    if (event.event === 'PHASE_CHANGED') {
      set({
        phase: event.data.phase,
        activePlayerId: event.data.activePlayerId,
        moveHighlight: null, // Clear move highlight on phase change
      });
    }
    if (event.event === 'CINEMATIC_TRIGGER') {
      const payload = event.data.payload as Record<string, unknown>;
      set({
        cinematic: {
          active: true,
          type: event.data.type,
          payload,
        }
      });
      // Capture SHOW_MOVEMENT hyperdrive for path highlighting
      if (event.data.type === 'SHOW_MOVEMENT') {
        set({
          moveHighlight: {
            hyperdrive: (payload.hyperdrive as number) ?? 4,
            startNodeId: (payload.startNodeId as number) ?? -1,
          }
        });
      }
    }
    if (event.event === 'COMBAT_RESULT') {
      // Show combat result via cinematic overlay
      set({
        cinematic: {
          active: true,
          type: 'COMBAT_RESULT',
          payload: event.data as Record<string, unknown>,
        }
      });
    }
    if (event.event === 'GAME_OVER') {
      const winnerId = event.data.winnerId as string;
      const winnerFame = event.data.fame as number;
      const players = useGameStore.getState().players;
      const winner = winnerId ? players.get(winnerId) : null;
      set({
        phase: 'GAME_OVER',
        gameOver: {
          winnerId,
          winnerName: winner?.displayName ?? 'Unknown',
          winnerFame,
        }
      });
    }
    if (event.event === 'DICE_ROLLED') {
      // Dice results processed by COMBAT_RESULT handler
    }
    if (event.event === 'PATROL_MOVED') {
      // State sync handles patrol position updates
    }
    if (event.event === 'ENCOUNTER_CARD') {
      set({
        cinematic: {
          active: true,
          type: 'ENCOUNTER_CARD',
          payload: event.data as Record<string, unknown>,
        }
      });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPlanningChoice: (c) => set({ planningChoice: c }),
  setConnectionStatus: (s) => set({ connectionStatus: s }),
  setMySessionId: (id) => set({ mySessionId: id }),
  dismissCinematic: () => set({ cinematic: { active: false, type: '', payload: {} } }),
}));

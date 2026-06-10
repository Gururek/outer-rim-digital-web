import type { GameState } from '../rooms/schema/GameState.js';
import type { FactionType, PatrolLevel } from '@outer-rim/shared';
import { MAP_NODES } from '@outer-rim/shared';

interface PatrolState {
  faction: FactionType;
  level: PatrolLevel;
  nodeId: number;
}

const PATROL_LEVEL_STATS: Record<PatrolLevel, { combatValue: number; creditReward: number; fameReward: number }> = {
  1: { combatValue: 2, creditReward: 1000, fameReward: 0 },
  2: { combatValue: 3, creditReward: 0, fameReward: 1 },
  3: { combatValue: 4, creditReward: 0, fameReward: 2 },
  4: { combatValue: Number.POSITIVE_INFINITY, creditReward: 0, fameReward: 3 },
};

export class PatrolManager {
  private patrols: Map<FactionType, PatrolState>;

  constructor(private state: GameState) {
    this.patrols = new Map();
  }

  initialize() {
    const factions: FactionType[] = ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'];
    for (const faction of factions) {
      // Place each faction's patrol on a random node owned by that faction
      const factionNodes = MAP_NODES.filter(n => n.factionOwner === faction);
      const startNode = factionNodes.length > 0
        ? factionNodes[Math.floor(Math.random() * factionNodes.length)].id
        : MAP_NODES[Math.floor(Math.random() * MAP_NODES.length)].id;

      const patrol: PatrolState = {
        faction,
        level: 1 as PatrolLevel,
        nodeId: startNode,
      };
      this.patrols.set(faction, patrol);
      this.syncToState(faction);
    }
  }

  private syncToState(faction: FactionType) {
    const p = this.patrols.get(faction);
    if (!p) return;
    switch (faction) {
      case 'HUTT':
        this.state.huttPatrolNode = p.nodeId;
        this.state.huttPatrolLevel = p.level;
        break;
      case 'SYNDICATE':
        this.state.syndicatePatrolNode = p.nodeId;
        this.state.syndicatePatrolLevel = p.level;
        break;
      case 'IMPERIAL':
        this.state.imperialPatrolNode = p.nodeId;
        this.state.imperialPatrolLevel = p.level;
        break;
      case 'REBEL':
        this.state.rebelPatrolNode = p.nodeId;
        this.state.rebelPatrolLevel = p.level;
        break;
    }
  }

  getPatrol(faction: FactionType): PatrolState & typeof PATROL_LEVEL_STATS[PatrolLevel] {
    const p = this.patrols.get(faction)!;
    return { ...p, ...PATROL_LEVEL_STATS[p.level] };
  }

  getPatrolNodeId(faction: FactionType): number {
    return this.patrols.get(faction)?.nodeId ?? -1;
  }

  getPatrolLevel(faction: FactionType): PatrolLevel {
    return this.patrols.get(faction)?.level ?? 1;
  }

  // Returns faction whose patrol is at the same node as the player AND player has negative rep with
  getMandatoryPatrolFaction(sessionId: string): FactionType | null {
    const ps = this.state.players.get(sessionId);
    if (!ps) return null;

    const factions: FactionType[] = ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'];
    const repMap: Record<FactionType, number> = {
      HUTT: ps.repHutt, SYNDICATE: ps.repSyndicate,
      IMPERIAL: ps.repImperial, REBEL: ps.repRebel, NONE: 0,
    };

    for (const faction of factions) {
      const patrol = this.patrols.get(faction);
      if (patrol && patrol.nodeId === ps.currentNodeId && repMap[faction] < 0) {
        return faction;
      }
    }
    return null;
  }

  eliminateAndSpawn(faction: FactionType) {
    const patrol = this.patrols.get(faction);
    if (!patrol) return;

    // Level up (max 4) and move to a random node
    patrol.level = Math.min(4, patrol.level + 1) as PatrolLevel;
    patrol.nodeId = MAP_NODES[Math.floor(Math.random() * MAP_NODES.length)].id;
    this.syncToState(faction);
  }

  // Player chooses where patrol moves after losing combat
  handlePlayerMovePatrol(sessionId: string, faction: FactionType, destNodeId: number) {
    const patrol = this.patrols.get(faction);
    if (!patrol) return;

    // Validate: must be adjacent to current position
    const currentNode = MAP_NODES.find(n => n.id === patrol.nodeId);
    if (!currentNode || !currentNode.connectedNodeIds.includes(destNodeId)) return;

    patrol.nodeId = destNodeId;
    this.syncToState(faction);
  }

  // All patrols move one step toward nearest player (end-of-round mechanic)
  moveAllPatrolsTowardPlayers() {
    for (const [, patrol] of this.patrols) {
      // Simple patrol movement: move to random adjacent node
      const node = MAP_NODES.find(n => n.id === patrol.nodeId);
      if (node && node.connectedNodeIds.length > 0) {
        const nextNode = node.connectedNodeIds[Math.floor(Math.random() * node.connectedNodeIds.length)];
        patrol.nodeId = nextNode;
      }
      this.syncToState(patrol.faction);
    }
  }

  // Move a single patrol one step toward nearest player (post-combat loss)
  moveOnePatrolTowardPlayers(faction: FactionType) {
    const patrol = this.patrols.get(faction);
    if (!patrol) return;
    const node = MAP_NODES.find(n => n.id === patrol.nodeId);
    if (node && node.connectedNodeIds.length > 0) {
      const nextNode = node.connectedNodeIds[Math.floor(Math.random() * node.connectedNodeIds.length)];
      patrol.nodeId = nextNode;
    }
    this.syncToState(faction);
  }

  getFactionPatrolNode(faction: FactionType): number {
    return this.patrols.get(faction)?.nodeId ?? -1;
  }
}

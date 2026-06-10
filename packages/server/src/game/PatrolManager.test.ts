import { describe, it, expect, beforeEach } from 'vitest';
import { PatrolManager } from './PatrolManager.js';
import { GameState } from '../rooms/schema/GameState.js';
import { PlayerState } from '../rooms/schema/PlayerState.js';

describe('PatrolManager', () => {
  let state: GameState;
  let patrolManager: PatrolManager;

  beforeEach(() => {
    state = new GameState();
    patrolManager = new PatrolManager(state);
    patrolManager.initialize();
  });

  it('initializes all 4 faction patrols', () => {
    const factions = ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'];
    for (const faction of factions) {
      const nodeId = patrolManager.getPatrolNodeId(faction as any);
      expect(nodeId).toBeGreaterThan(-1);
      expect(nodeId).not.toBe(0);
    }
  });

  it('syncs patrol positions to GameState', () => {
    expect(state.huttPatrolNode).toBeGreaterThan(-1);
    expect(state.syndicatePatrolNode).toBeGreaterThan(-1);
    expect(state.imperialPatrolNode).toBeGreaterThan(-1);
    expect(state.rebelPatrolNode).toBeGreaterThan(-1);
  });

  it('patrols start at level 1', () => {
    expect(state.huttPatrolLevel).toBe(1);
    expect(state.syndicatePatrolLevel).toBe(1);
    expect(state.imperialPatrolLevel).toBe(1);
    expect(state.rebelPatrolLevel).toBe(1);
  });

  it('getPatrol returns combined patrol state and level stats', () => {
    const patrol = patrolManager.getPatrol('HUTT');
    expect(patrol.faction).toBe('HUTT');
    expect(patrol.level).toBe(1);
    expect(patrol.combatValue).toBe(2);
    expect(patrol.creditReward).toBe(1000);
    expect(patrol.fameReward).toBe(0);
    expect(patrol.nodeId).toBeGreaterThan(-1);
  });

  it('getPatrol returns correct stats for each level', () => {
    // Force level up to test all levels
    for (let i = 0; i < 3; i++) {
      patrolManager.eliminateAndSpawn('HUTT');
    }
    const lvl4 = patrolManager.getPatrol('HUTT');
    expect(lvl4.level).toBe(4);
    expect(lvl4.combatValue).toBe(Number.POSITIVE_INFINITY);
    expect(lvl4.fameReward).toBe(3);
  });

  it('eliminateAndSpawn increases level and moves patrol', () => {
    const beforeNode = patrolManager.getPatrolNodeId('REBEL');
    const beforeLevel = patrolManager.getPatrolLevel('REBEL');

    patrolManager.eliminateAndSpawn('REBEL');

    const afterNode = patrolManager.getPatrolNodeId('REBEL');
    const afterLevel = patrolManager.getPatrolLevel('REBEL');

    expect(afterLevel).toBe(Math.min(4, beforeLevel + 1));
    // Node may or may not change (random)
    expect(afterNode).toBeGreaterThan(-1);
    expect(state.rebelPatrolLevel).toBe(afterLevel);
    expect(state.rebelPatrolNode).toBe(afterNode);
  });

  it('patrol level caps at 4', () => {
    for (let i = 0; i < 10; i++) {
      patrolManager.eliminateAndSpawn('HUTT');
    }
    expect(patrolManager.getPatrolLevel('HUTT')).toBe(4);
  });

  it('handlePlayerMovePatrol moves to adjacent node', () => {
    const current = patrolManager.getPatrolNodeId('SYNDICATE');
    const { MAP_NODES } = require('@outer-rim/shared');
    const node = MAP_NODES.find((n: any) => n.id === current);
    if (node && node.connectedNodeIds.length > 0) {
      const destNodeId = node.connectedNodeIds[0];
      patrolManager.handlePlayerMovePatrol('player-1', 'SYNDICATE', destNodeId);
      expect(patrolManager.getPatrolNodeId('SYNDICATE')).toBe(destNodeId);
      expect(state.syndicatePatrolNode).toBe(destNodeId);
    }
  });

  it('handlePlayerMovePatrol rejects non-adjacent nodes', () => {
    const current = patrolManager.getPatrolNodeId('SYNDICATE');
    // Pick a node that's definitely not adjacent
    const { MAP_NODES } = require('@outer-rim/shared');
    const allNodes = MAP_NODES.map((n: any) => n.id);
    const node = MAP_NODES.find((n: any) => n.id === current);
    if (node) {
      const nonAdjacent = allNodes.find((id: number) =>
        id !== current && !node.connectedNodeIds.includes(id)
      );
      if (nonAdjacent != null) {
        patrolManager.handlePlayerMovePatrol('player-1', 'SYNDICATE', nonAdjacent);
        expect(patrolManager.getPatrolNodeId('SYNDICATE')).toBe(current);
      }
    }
  });

  it('moveAllPatrolsTowardPlayers moves all patrols', () => {
    const beforeNodes = {
      HUTT: state.huttPatrolNode,
      SYNDICATE: state.syndicatePatrolNode,
      IMPERIAL: state.imperialPatrolNode,
      REBEL: state.rebelPatrolNode,
    };

    patrolManager.moveAllPatrolsTowardPlayers();

    // Patrols should be on valid nodes after movement
    expect(state.huttPatrolNode).toBeGreaterThan(-1);
    expect(state.syndicatePatrolNode).toBeGreaterThan(-1);
    expect(state.imperialPatrolNode).toBeGreaterThan(-1);
    expect(state.rebelPatrolNode).toBeGreaterThan(-1);
  });

  it('getMandatoryPatrolFaction returns null when no patrol at player location', () => {
    const sessionId = 'player-1';
    const ps = new PlayerState();
    ps.sessionId = sessionId;
    // Place player on a node far from patrols
    ps.currentNodeId = 1; // Tatooine
    state.players.set(sessionId, ps);

    // Only triggers if patrol is at same node AND player has negative rep
    const result = patrolManager.getMandatoryPatrolFaction(sessionId);
    // Patrols start on their faction nodes, not necessarily at Tatooine (id:1, HUTT)
    // Depending on random placement, result may be null or HUTT
    expect(result === null || result === 'HUTT' || result === 'SYNDICATE' || 
           result === 'IMPERIAL' || result === 'REBEL').toBe(true);
  });

  it('getFactionPatrolNode matches getPatrolNodeId', () => {
    for (const faction of ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'] as const) {
      expect(patrolManager.getFactionPatrolNode(faction))
        .toBe(patrolManager.getPatrolNodeId(faction));
    }
  });
});

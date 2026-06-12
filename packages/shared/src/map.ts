import type { MapNode } from './types.js';

// ─── GALAXY MAP NODE GRAPH ────────────────────────────────────────────────────
// Positions follow the arch/horseshoe layout of the physical board.
// Outer arc runs left-to-right over the top; inner track cuts across the middle.
// X: –12 (left) → +12 (right)   Z: –12 (far/top of arch) → +4 (near/opening)

export const MAP_NODES: MapNode[] = [
  // ── Outer arc — left arm (bottom → apex) ────────────────────────────────
  {
    id: 1, name: 'Tatooine', planetId: 'tatooine', type: 'PLANET', factionOwner: 'HUTT',
    connectedNodeIds: [2, 3, 4],
    contactSpaces: [{ class: 'WHITE', pipCount: 2 }, { class: 'GREEN', pipCount: 1 }],
    position: [-4.5, 0, -10.5],
  },
  // ── Outer arc — right arm ────────────────────────────────────────────────
  {
    id: 2, name: 'Rodia', planetId: 'rodia', type: 'PLANET', factionOwner: 'HUTT',
    connectedNodeIds: [1, 4, 5],
    contactSpaces: [{ class: 'WHITE', pipCount: 1 }, { class: 'YELLOW', pipCount: 1 }],
    position: [10.5, 0, 1.5],
  },
  {
    id: 3, name: 'Ryloth', planetId: 'ryloth', type: 'PLANET', factionOwner: 'SYNDICATE',
    connectedNodeIds: [1, 4, 6],
    contactSpaces: [{ class: 'GREEN', pipCount: 1 }, { class: 'ORANGE', pipCount: 1 }],
    position: [-1.5, 0, -11.5],
  },
  {
    id: 4, name: 'Nav Point Aurek', planetId: 'np_aurek', type: 'NAVPOINT', factionOwner: 'NONE',
    connectedNodeIds: [1, 2, 3, 5, 6],
    contactSpaces: [],
    position: [2, 0, -11],
  },
  {
    id: 5, name: 'Mon Cala', planetId: 'mon_cala', type: 'PLANET', factionOwner: 'REBEL',
    connectedNodeIds: [2, 4, 7],
    contactSpaces: [{ class: 'WHITE', pipCount: 1 }, { class: 'GREEN', pipCount: 2 }],
    position: [11, 0, -3],
  },
  {
    id: 6, name: 'Geonosis', planetId: 'geonosis', type: 'PLANET', factionOwner: 'IMPERIAL',
    connectedNodeIds: [3, 4, 8],
    contactSpaces: [{ class: 'YELLOW', pipCount: 2 }],
    position: [5, 0, -9.5],
  },
  {
    id: 7, name: 'Nav Point Besh', planetId: 'np_besh', type: 'NAVPOINT', factionOwner: 'NONE',
    connectedNodeIds: [5, 8, 9],
    contactSpaces: [],
    position: [8.5, 0, -7],
  },
  // ── Inner track ──────────────────────────────────────────────────────────
  {
    id: 8, name: 'Corellia', planetId: 'corellia', type: 'PLANET', factionOwner: 'IMPERIAL',
    connectedNodeIds: [6, 7, 9, 10],
    contactSpaces: [{ class: 'GREEN', pipCount: 1 }, { class: 'YELLOW', pipCount: 1 }],
    position: [4.5, 0, -3.5],
  },
  {
    id: 9, name: 'Nav Point Cresh', planetId: 'np_cresh', type: 'NAVPOINT', factionOwner: 'NONE',
    connectedNodeIds: [7, 8, 10, 11],
    contactSpaces: [],
    position: [0, 0, -5],
  },
  {
    id: 10, name: 'Ord Mantell', planetId: 'ord_mantell', type: 'PLANET', factionOwner: 'SYNDICATE',
    connectedNodeIds: [8, 9, 11, 12],
    contactSpaces: [{ class: 'WHITE', pipCount: 2 }, { class: 'ORANGE', pipCount: 1 }],
    position: [-4.5, 0, -3.5],
  },
  {
    id: 11, name: 'Maelstrom', planetId: 'maelstrom', type: 'MAELSTROM', factionOwner: 'NONE',
    connectedNodeIds: [9, 10, 12],
    contactSpaces: [],
    position: [0, 0, 0.5],
  },
  // ── Outer arc — left arm ─────────────────────────────────────────────────
  {
    id: 12, name: 'Nal Hutta', planetId: 'nal_hutta', type: 'PLANET', factionOwner: 'HUTT',
    connectedNodeIds: [10, 11, 13],
    contactSpaces: [{ class: 'GREEN', pipCount: 1 }, { class: 'YELLOW', pipCount: 2 }],
    position: [-10, 0, 3],
  },
  {
    id: 13, name: 'Nav Point Dorn', planetId: 'np_dorn', type: 'NAVPOINT', factionOwner: 'NONE',
    connectedNodeIds: [12, 14, 15],
    contactSpaces: [],
    position: [-11.5, 0, -1],
  },
  {
    id: 14, name: 'Kessel', planetId: 'kessel', type: 'PLANET', factionOwner: 'SYNDICATE',
    connectedNodeIds: [13, 15],
    contactSpaces: [{ class: 'YELLOW', pipCount: 1 }, { class: 'ORANGE', pipCount: 1 }],
    position: [-10.5, 0, -5],
  },
  {
    id: 15, name: 'Nav Point Esk', planetId: 'np_esk', type: 'NAVPOINT', factionOwner: 'NONE',
    connectedNodeIds: [13, 14, 1],
    contactSpaces: [],
    position: [-7.5, 0, -8.5],
  },
];

// ─── MAP HELPERS ──────────────────────────────────────────────────────────────
export function getNodeById(id: number): MapNode | undefined {
  return MAP_NODES.find(n => n.id === id);
}

export function getNodeByName(name: string): MapNode | undefined {
  return MAP_NODES.find(n => n.name.toLowerCase() === name.toLowerCase());
}

export function getConnectedNodes(nodeId: number): MapNode[] {
  const node = getNodeById(nodeId);
  if (!node) return [];
  return node.connectedNodeIds.map(id => getNodeById(id)).filter(Boolean) as MapNode[];
}

export function getNodesByFaction(faction: string): MapNode[] {
  return MAP_NODES.filter(n => n.factionOwner === faction);
}

// ─── PATHFINDING — BFS for shortest path within hyperdrive range ──────────────
export function findPath(
  startNodeId: number,
  endNodeId: number,
  maxDistance: number
): number[] | null {
  if (startNodeId === endNodeId) return [startNodeId];

  const visited = new Set<number>();
  const queue: { nodeId: number; path: number[] }[] = [{ nodeId: startNodeId, path: [startNodeId] }];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = getNodeById(current.nodeId);
    if (!node) continue;

    for (const neighborId of node.connectedNodeIds) {
      if (neighborId === endNodeId) {
        return [...current.path, neighborId];
      }
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const newPath = [...current.path, neighborId];
        if (newPath.length - 1 <= maxDistance) {
          queue.push({ nodeId: neighborId, path: newPath });
        }
      }
    }
  }
  return null; // No path found within range
}

export function getPathDistance(path: number[] | null): number {
  if (!path) return Infinity;
  return path.length - 1; // Number of jumps = number of nodes - 1
}

export function isValidMove(
  fromNodeId: number,
  toNodeId: number,
  hyperdrive: number
): boolean {
  const path = findPath(fromNodeId, toNodeId, hyperdrive);
  return path !== null;
}

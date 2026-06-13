import { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { Vector2 } from 'three';
import { MAP_NODES } from '@outer-rim/shared';
import PlanetNode from './nodes/PlanetNode';
import NavPointNode from './nodes/NavPointNode';
import PlayerShip from './ships/PlayerShip';
import PatrolShip from './ships/PatrolShip';
import HyperspaceLines from './fx/HyperspaceLines';
import CameraAnimator from './fx/CameraAnimator';
import NebulaBackground from './fx/NebulaBackground';
import { useGameStore } from '../stores/gameStore';

interface GalaxyMapProps {
  onMoveConfirm?: (nodeId: number) => void;
}

export default function GalaxyMap({ onMoveConfirm }: GalaxyMapProps) {
  const phase = useGameStore(s => s.phase);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players = useGameStore(s => s.players);
  const moveHighlight = useGameStore(s => s.moveHighlight);
  const controlsRef = useRef<any>(null);

  const myPlayer = players.get(mySessionId);
  const isMyTurn = activePlayerId === mySessionId;
  const canMove = phase === 'ACTION' && isMyTurn && onMoveConfirm != null;

  // Compute set of reachable node IDs within hyperdrive range
  const reachableNodeIds = useMemo<Set<number>>(() => {
    if (!canMove || !myPlayer) return new Set();
    const hyperdrive = moveHighlight?.hyperdrive ?? 4;
    const startId = myPlayer.currentNodeId;
    const reachable = new Set<number>();
    // BFS: find all nodes reachable within hyperdrive hops
    const visited = new Set<number>();
    const queue: { nodeId: number; hops: number }[] = [{ nodeId: startId, hops: 0 }];
    visited.add(startId);
    while (queue.length > 0) {
      const { nodeId, hops } = queue.shift()!;
      if (hops >= hyperdrive) continue;
      const node = MAP_NODES.find(n => n.id === nodeId);
      if (!node) continue;
      for (const neighborId of node.connectedNodeIds) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          reachable.add(neighborId);
          queue.push({ nodeId: neighborId, hops: hops + 1 });
        }
      }
    }
    return reachable;
  }, [canMove, myPlayer?.currentNodeId, moveHighlight?.hyperdrive]);

  return (
    <Canvas
      camera={{ position: [0, 20, 5], fov: 65 }}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.12} />
      {/* Primary cool key light — overhead */}
      <pointLight position={[0, 30, 0]} intensity={0.7} color="#4488cc" />
      {/* Warm fill light — Outer Rim sun analogue */}
      <directionalLight position={[-12, 8, -14]} intensity={0.35} color="#ffcc88" />
      {/* Rim light from below for ship undersides */}
      <pointLight position={[0, -8, 0]} intensity={0.15} color="#224466" />

      {/* Space background */}
      <Stars radius={400} depth={80} count={18000} factor={7} fade />

      {/* Nebula floor + arch tube */}
      <NebulaBackground />

      {/* Hyperspace lane connections */}
      <HyperspaceLines nodes={MAP_NODES} />

      {/* Map nodes */}
      {MAP_NODES.map(node =>
        node.type === 'PLANET' ? (
          <PlanetNode
            key={node.id}
            node={node}
            isReachable={reachableNodeIds.has(node.id)}
            onMoveConfirm={onMoveConfirm}
          />
        ) : node.type === 'NAVPOINT' ? (
          <NavPointNode
            key={node.id}
            node={node}
            isReachable={reachableNodeIds.has(node.id)}
            onMoveConfirm={onMoveConfirm}
          />
        ) : node.type === 'MAELSTROM' ? (
          <NavPointNode
            key={node.id}
            node={node}
            isReachable={reachableNodeIds.has(node.id)}
            onMoveConfirm={onMoveConfirm}
          />
        ) : null
      )}

      {/* Player ships */}
      <PlayerShips />

      {/* Patrol ships */}
      <PatrolShips />

      {/* Camera controls */}
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, -4]}
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Cinematic camera animation */}
      <CameraAnimator controlsRef={controlsRef} />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.10}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0007, 0.0007)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette offset={0.25} darkness={0.65} eskil={false} />
      </EffectComposer>
    </Canvas>
  );
}

function PlayerShips() {
  const players = useGameStore(s => s.players);
  const mySessionId = useGameStore(s => s.mySessionId);
  const entries = Array.from(players.entries());
  return (
    <>
      {entries.map(([sessionId, player]) => (
        <PlayerShip
          key={sessionId}
          sessionId={sessionId}
          playerData={{
            displayName: player.displayName,
            currentNodeId: player.currentNodeId,
            characterId: player.characterId,
            shipId: player.shipId,
          }}
          isLocalPlayer={sessionId === mySessionId}
        />
      ))}
    </>
  );
}

function PatrolShips() {
  const patrolNodes = useGameStore(s => s.patrolNodes);
  const factions = (Object.keys(patrolNodes) as Array<keyof typeof patrolNodes>)
    .filter(k => k !== 'NONE');
  return (
    <>
      {factions.map((faction) => (
        <PatrolShip key={faction} faction={faction as import('@outer-rim/shared').FactionType} nodeId={patrolNodes[faction]} />
      ))}
    </>
  );
}

import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { Vector2 } from 'three';
import { MAP_NODES } from '@outer-rim/shared';
import PlanetNode from './nodes/PlanetNode';
import NavPointNode from './nodes/NavPointNode';
import PlayerShip from './ships/PlayerShip';
import PatrolShip from './ships/PatrolShip';
import HyperspaceLines from './fx/HyperspaceLines';
import { useGameStore } from '../stores/gameStore';

interface GalaxyMapProps {
  onMoveConfirm?: (nodeId: number) => void;
}

export default function GalaxyMap({ onMoveConfirm }: GalaxyMapProps) {
  return (
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
        node.type === 'PLANET' ? (
          <PlanetNode key={node.id} node={node} onMoveConfirm={onMoveConfirm} />
        ) : node.type === 'NAVPOINT' ? (
          <NavPointNode key={node.id} node={node} onMoveConfirm={onMoveConfirm} />
        ) : node.type === 'MAELSTROM' ? (
          <NavPointNode key={node.id} node={node} onMoveConfirm={onMoveConfirm} />
        ) : null
      )}

      {/* Player ships */}
      <PlayerShips />

      {/* Patrol ships */}
      <PatrolShips />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={10}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.85} luminanceSmoothing={0.9} />
        <ChromaticAberration offset={new Vector2(0.0005, 0.0005)} radialModulation={false} modulationOffset={0} />
      </EffectComposer>
    </Canvas>
  );
}

function PlayerShips() {
  const players = useGameStore(s => s.players);
  const mySessionId = useGameStore(s => s.mySessionId);
  return (
    <>
      {Array.from(players.entries()).map(([id, ps]) => (
        <PlayerShip
          key={id}
          sessionId={id}
          playerData={ps}
          isLocalPlayer={id === mySessionId}
        />
      ))}
    </>
  );
}

function PatrolShips() {
  const patrolNodes = useGameStore(s => s.patrolNodes);
  const factions = ['HUTT', 'SYNDICATE', 'IMPERIAL', 'REBEL'] as const;

  return (
    <>
      {factions.map(f => (
        <PatrolShip key={f} faction={f} nodeId={patrolNodes[f] ?? -1} />
      ))}
    </>
  );
}

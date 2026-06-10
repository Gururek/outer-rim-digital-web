import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MAP_NODES } from '@outer-rim/shared';
import type { FactionType } from '@outer-rim/shared';

interface Props {
  faction: FactionType;
  nodeId: number;
}

const FACTION_COLORS: Record<string, string> = {
  HUTT: '#d4a017',
  SYNDICATE: '#8b0000',
  IMPERIAL: '#1a5276',
  REBEL: '#2e7d32',
};

const FACTION_NAMES: Record<string, string> = {
  HUTT: 'Hutt Patrol',
  SYNDICATE: 'Syndicate',
  IMPERIAL: 'Imperial',
  REBEL: 'Rebel',
};

export default function PatrolShip({ faction, nodeId }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef(0);
  const node = MAP_NODES.find(n => n.id === nodeId);
  const color = FACTION_COLORS[faction] || '#888888';

  useFrame((_, delta) => {
    if (groupRef.current && node) {
      // Orbit the node
      orbitRef.current += delta * 0.5;
      const orbitRadius = 1.8;
      const ox = Math.cos(orbitRef.current) * orbitRadius;
      const oz = Math.sin(orbitRef.current) * orbitRadius;

      const [tx, ty, tz] = node.position;
      groupRef.current.position.lerp(
        new THREE.Vector3(tx + ox, ty + 0.6, tz + oz),
        delta * 2
      );

      // Face direction of orbit
      groupRef.current.rotation.y = -orbitRef.current + Math.PI / 2;
    }
  });

  if (!node || nodeId < 0) return null;

  return (
    <group ref={groupRef}>
      {/* Patrol ship — diamond shape */}
      <mesh>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Patrol label */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {FACTION_NAMES[faction]}
      </Text>
    </group>
  );
}

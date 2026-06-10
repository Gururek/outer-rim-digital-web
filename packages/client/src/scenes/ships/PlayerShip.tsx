import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MAP_NODES } from '@outer-rim/shared';

interface Props {
  sessionId: string;
  playerData: {
    displayName: string;
    currentNodeId: number;
    characterId: string;
  };
  isLocalPlayer: boolean;
}

export default function PlayerShip({ sessionId, playerData, isLocalPlayer }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const node = MAP_NODES.find(n => n.id === playerData.currentNodeId);

  useFrame((_, delta) => {
    if (groupRef.current && node) {
      const [tx, ty, tz] = node.position;
      groupRef.current.position.lerp(
        new THREE.Vector3(tx, ty + 0.8, tz),
        delta * 3
      );
    }
  });

  if (!node) return null;

  return (
    <group ref={groupRef} position={[node.position[0], node.position[1] + 0.8, node.position[2]]}>
      {/* Ship body — placeholder triangle/wedge shape until GLB models */}
      <mesh>
        <coneGeometry args={[0.3, 0.8, 4, 1]} />
        <meshStandardMaterial
          color={isLocalPlayer ? '#00ff88' : '#ffaa00'}
          emissive={isLocalPlayer ? '#00ff44' : '#ff8800'}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Engine glow */}
      <mesh position={[0, 0, -0.45]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color={isLocalPlayer ? '#00ff88' : '#ff6600'} />
      </mesh>

      {/* Player name */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.25}
        color={isLocalPlayer ? '#00ff88' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {playerData.displayName}
      </Text>
    </group>
  );
}

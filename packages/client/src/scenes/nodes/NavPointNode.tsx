import { useRef, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { MapNode } from '@outer-rim/shared';

interface Props {
  node: MapNode;
  isReachable: boolean;
  onMoveConfirm?: (nodeId: number) => void;
}

export default function NavPointNode({ node, isReachable, onMoveConfirm }: Props) {
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (isReachable && onMoveConfirm) {
      onMoveConfirm(node.id);
    }
  }, [isReachable, onMoveConfirm, node.id]);

  const isMaelstrom = node.type === 'MAELSTROM';
  const baseColor = isMaelstrom ? '#440044' : '#334455';
  const ringColor = isReachable
    ? (hovered ? '#ffd700' : '#00ff88')
    : isMaelstrom ? '#8800aa' : '#4488ff';

  useFrame(() => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.004) * 0.06;
      glowRef.current.scale.setScalar(isReachable ? scale : 1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isReachable
        ? 0.25 + Math.sin(Date.now() * 0.005) * 0.1
        : 0;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <group position={node.position}>
        {/* Reachable glow ring */}
        <mesh ref={glowRef}>
          <torusGeometry args={[0.85, 0.06, 16, 32]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {/* Nav beacon — octahedron */}
        <mesh
          onClick={handleClick}
          onPointerOver={() => isReachable && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            color={isReachable ? ringColor : baseColor}
            emissive={isReachable ? ringColor : (isMaelstrom ? '#330033' : '#223344')}
            emissiveIntensity={isReachable ? 1.2 : 0.6}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Pulsing ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.02, 8, 24]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={isReachable ? 0.8 : 0.4}
          />
        </mesh>

        {/* Name label */}
        <Text
          position={[0, -0.9, 0]}
          fontSize={0.25}
          color={isReachable ? '#00ff88' : '#8899aa'}
          anchorX="center"
          anchorY="top"
        >
          {isReachable ? `→ ${node.name}` : node.name}
        </Text>
      </group>
    </Float>
  );
}

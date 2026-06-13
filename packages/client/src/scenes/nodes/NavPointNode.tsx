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
  const glowRef  = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef  = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (isReachable && onMoveConfirm) onMoveConfirm(node.id);
  }, [isReachable, onMoveConfirm, node.id]);

  const isMaelstrom = node.type === 'MAELSTROM';
  const coreColor  = isMaelstrom ? '#8800cc' : (isReachable ? (hovered ? '#ffd700' : '#00ff88') : '#4466aa');
  const ringColor  = isMaelstrom ? '#aa22ff' : (isReachable ? (hovered ? '#ffd700' : '#00ff88') : '#2255aa');

  useFrame((_, delta) => {
    const t = Date.now() * 0.001;
    // Holographic rings counter-rotate for gyroscopic look
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.55;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= delta * 0.40;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.30;

    // Core gem pulses
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 2.5) * 0.08;
      coreRef.current.scale.setScalar(isReachable ? s * 1.1 : s);
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        isReachable ? 1.6 + Math.sin(t * 3) * 0.4 : 0.9 + Math.sin(t * 2) * 0.2;
    }

    // Reachable outer glow ring
    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * 2.8) * 0.07;
      glowRef.current.scale.setScalar(isReachable ? pulse : 1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isReachable
        ? 0.22 + Math.sin(t * 3.2) * 0.08 : 0;
    }
  });

  const ringMat = (
    <meshBasicMaterial
      color={ringColor}
      transparent
      opacity={isReachable ? 0.85 : 0.45}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  );

  return (
    <Float speed={1.4} rotationIntensity={0.1} floatIntensity={0.18}>
      <group position={node.position}>

        {/* Outer reachable pulse ring */}
        <mesh ref={glowRef}>
          <torusGeometry args={[0.95, 0.055, 16, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Three gyroscopic holographic rings */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 8, 32]} />
          {ringMat}
        </mesh>
        <mesh ref={ring2Ref} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 8, 32]} />
          {ringMat}
        </mesh>
        <mesh ref={ring3Ref} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[0.62, 0.018, 8, 32]} />
          {ringMat}
        </mesh>

        {/* Central crystal gem — clickable */}
        <mesh
          ref={coreRef}
          onClick={handleClick}
          onPointerOver={() => isReachable && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={0.9}
            metalness={0.6}
            roughness={0.15}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner glow halo */}
        <mesh>
          <sphereGeometry args={[0.38, 10, 10]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Name label */}
        <Text
          position={[0, -0.95, 0]}
          fontSize={0.24}
          color={isReachable ? '#00ff88' : (isMaelstrom ? '#aa44cc' : '#6688aa')}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.018}
          outlineColor="#000000"
        >
          {isReachable ? `→ ${node.name}` : node.name}
        </Text>
      </group>
    </Float>
  );
}

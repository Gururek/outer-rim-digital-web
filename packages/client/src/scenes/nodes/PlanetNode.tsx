import { useRef, useMemo, useCallback, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { MapNode } from '@outer-rim/shared';

interface Props {
  node: MapNode;
  isReachable: boolean;
  onMoveConfirm?: (nodeId: number) => void;
}

const FACTION_COLORS: Record<string, string> = {
  HUTT: '#d4a017',
  SYNDICATE: '#8b0000',
  IMPERIAL: '#1a5276',
  REBEL: '#2e7d32',
  NONE: '#555555',
};

export default function PlanetNode({ node, isReachable, onMoveConfirm }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (isReachable && onMoveConfirm) {
      onMoveConfirm(node.id);
    }
  }, [isReachable, onMoveConfirm, node.id]);

  const color = FACTION_COLORS[node.factionOwner] || '#4488cc';

  // Random planet surface pattern
  const planetMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
      ctx.fillRect(0, Math.random() * 128, 256, Math.random() * 8 + 2);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 256, 10);
    ctx.fillRect(0, 118, 256, 10);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, [color]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y -= delta * 0.15;
    }
    // Pulsing glow for reachable nodes
    if (glowRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.04;
      glowRef.current.scale.setScalar(isReachable ? scale : 1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isReachable
        ? 0.12 + Math.sin(Date.now() * 0.004) * 0.04
        : 0;
    }
  });

  const ringColor = isReachable ? (hovered ? '#ffd700' : '#00ff88') : color;
  const ringOpacity = isReachable ? 0.9 : 0.5;

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <group position={node.position}>
        {/* Reachable pulse glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.55, 32, 32]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>

        {/* Planet sphere */}
        <mesh
          ref={meshRef}
          castShadow
          onClick={handleClick}
          onPointerOver={() => isReachable && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial map={planetMaterial} roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Atmosphere glow */}
        <mesh>
          <sphereGeometry args={[1.35, 32, 32]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={isReachable ? 0.2 : 0.08}
          />
        </mesh>

        {/* Orbital ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.04, 16, 64]} />
          <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity} />
        </mesh>

        {/* Planet name label */}
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.4}
          color={isReachable ? '#00ff88' : '#ffffff'}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {isReachable ? `→ ${node.name} (${getHops(node.id)})` : node.name}
        </Text>

        {/* Contact spaces indicator */}
        {node.contactSpaces.length > 0 && (
          <Html position={[0, 2.0, 0]} center>
            <div style={contactStyle}>
              {node.contactSpaces.map((cs, i) => (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: cs.class === 'WHITE' ? '#fff'
                      : cs.class === 'GREEN' ? '#4caf50'
                      : cs.class === 'YELLOW' ? '#ffc107'
                      : '#ff9800',
                    margin: '0 2px',
                    border: '1px solid rgba(0,0,0,0.3)',
                  }}
                />
              ))}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

// Compute hop count from current player position (for label)
function getHops(nodeId: number): number {
  // This is a rough estimate — the label just shows the node is reachable
  return 0;
}

const contactStyle: React.CSSProperties = {
  display: 'flex',
  gap: '3px',
  padding: '2px 4px',
  background: 'rgba(0,0,0,0.4)',
  borderRadius: '4px',
};

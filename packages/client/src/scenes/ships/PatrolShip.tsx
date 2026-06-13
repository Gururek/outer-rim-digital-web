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
  HUTT:      '#d4a017',
  SYNDICATE: '#aa1111',
  IMPERIAL:  '#5577bb',
  REBEL:     '#dd5500',
};

const FACTION_ORBIT_SPEED: Record<string, number> = {
  IMPERIAL: 0.55,
  REBEL:    0.40,
  HUTT:     0.25,
  SYNDICATE:0.60,
};

const FACTION_NAMES: Record<string, string> = {
  HUTT:      'Hutt Patrol',
  SYNDICATE: 'Syndicate',
  IMPERIAL:  'Imperial',
  REBEL:     'Rebel',
};

// ─── Per-faction ship geometry ────────────────────────────────────────────────

function ImperialMesh({ color }: { color: string }) {
  // Flat wedge hull — top-down Star Destroyer silhouette with command tower
  const m = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.38} metalness={0.9} roughness={0.14} />;
  const mDim = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.20} metalness={0.85} roughness={0.2} />;
  return (
    <group>
      {/* Flat triangular wedge hull */}
      <mesh scale={[0.52, 0.07, 0.68]} rotation={[0, Math.PI, 0]}>
        <cylinderGeometry args={[0, 1, 1, 3, 1]} />
        {m}
      </mesh>
      {/* Command superstructure */}
      <mesh position={[0, 0.11, 0.06]}>
        <boxGeometry args={[0.10, 0.14, 0.13]} />
        {m}
      </mesh>
      {/* Deflector dish stub */}
      <mesh position={[0, 0.20, 0.06]}>
        <cylinderGeometry args={[0.04, 0.02, 0.04, 5]} />
        {mDim}
      </mesh>
    </group>
  );
}

function RebelMesh({ color }: { color: string }) {
  // Elongated fuselage with four S-foil wings in an X pattern
  const m    = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.38} metalness={0.75} roughness={0.22} />;
  const mWing= <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} metalness={0.7} roughness={0.28} />;
  return (
    <group>
      {/* Fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.07, 0.55, 6, 1]} />
        {m}
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0, -0.34]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.18, 6]} />
        {m}
      </mesh>
      {/* Engine block */}
      <mesh position={[0, 0, 0.34]}>
        <boxGeometry args={[0.09, 0.09, 0.10]} />
        {m}
      </mesh>
      {/* Four S-foil wings at 45° rotations */}
      {[Math.PI / 4, -Math.PI / 4].map((roll, i) => (
        <group key={i} rotation={[0, 0, roll]}>
          <mesh position={[0.30, 0, 0]}>
            <boxGeometry args={[0.28, 0.035, 0.16]} />
            {mWing}
          </mesh>
          <mesh position={[-0.30, 0, 0]}>
            <boxGeometry args={[0.28, 0.035, 0.16]} />
            {mWing}
          </mesh>
        </group>
      ))}
    </group>
  );
}

function HuttMesh({ color }: { color: string }) {
  // Sail barge: wide, slug-like hull with flat deck and a sail fin
  const m = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.36} metalness={0.5} roughness={0.45} />;
  const mDim = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.20} metalness={0.5} roughness={0.4} />;
  return (
    <group>
      {/* Bulbous main hull */}
      <mesh scale={[1.25, 0.55, 1.65]}>
        <sphereGeometry args={[0.24, 10, 7]} />
        {m}
      </mesh>
      {/* Flat top deck */}
      <mesh position={[0, 0.17, 0]}>
        <boxGeometry args={[0.40, 0.055, 0.52]} />
        {m}
      </mesh>
      {/* Vertical sail fin */}
      <mesh position={[0, 0.32, 0.10]}>
        <boxGeometry args={[0.055, 0.26, 0.22]} />
        {mDim}
      </mesh>
      {/* Side pontoons */}
      <mesh position={[-0.38, -0.02, 0]} scale={[0.14, 0.14, 1.1]}>
        <cylinderGeometry args={[1, 1, 0.5, 6]} />
        {mDim}
      </mesh>
      <mesh position={[0.38, -0.02, 0]} scale={[0.14, 0.14, 1.1]}>
        <cylinderGeometry args={[1, 1, 0.5, 6]} />
        {mDim}
      </mesh>
    </group>
  );
}

function SyndicateMesh({ color }: { color: string }) {
  // Predatory angular shard: forward-swept diamond body + blade wings
  const m = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} metalness={0.90} roughness={0.12} />;
  const mBlade = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} metalness={0.88} roughness={0.15} />;
  return (
    <group>
      {/* Forward pointed body */}
      <mesh rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[0.44, 0.25, 0.80]}>
        <coneGeometry args={[0.5, 1, 4, 1]} />
        {m}
      </mesh>
      {/* Rear body stub */}
      <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, Math.PI / 4, 0]} scale={[0.44, 0.25, 0.45]}>
        <coneGeometry args={[0.5, 0.5, 4, 1]} />
        {m}
      </mesh>
      {/* Swept wing blades */}
      <mesh position={[-0.30, 0.0, 0.14]} rotation={[0.15, -0.25, 0.45]}>
        <boxGeometry args={[0.24, 0.03, 0.32]} />
        {mBlade}
      </mesh>
      <mesh position={[0.30, 0.0, 0.14]} rotation={[-0.15, 0.25, -0.45]}>
        <boxGeometry args={[0.24, 0.03, 0.32]} />
        {mBlade}
      </mesh>
    </group>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatrolShip({ faction, nodeId }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef(0);
  const node = MAP_NODES.find(n => n.id === nodeId);
  const color = FACTION_COLORS[faction] ?? '#888888';
  const speed = FACTION_ORBIT_SPEED[faction] ?? 0.4;

  useFrame((_, delta) => {
    if (groupRef.current && node) {
      orbitRef.current += delta * speed;
      const r = 1.9;
      const ox = Math.cos(orbitRef.current) * r;
      const oz = Math.sin(orbitRef.current) * r;
      const [tx, ty, tz] = node.position;
      groupRef.current.position.lerp(
        new THREE.Vector3(tx + ox, ty + 0.65, tz + oz),
        delta * 2
      );
      groupRef.current.rotation.y = -orbitRef.current + Math.PI / 2;
    }
  });

  if (!node || nodeId < 0) return null;

  return (
    <group ref={groupRef}>
      {faction === 'IMPERIAL'  && <ImperialMesh  color={color} />}
      {faction === 'REBEL'     && <RebelMesh     color={color} />}
      {faction === 'HUTT'      && <HuttMesh      color={color} />}
      {faction === 'SYNDICATE' && <SyndicateMesh color={color} />}

      {/* Engine wake glow */}
      <mesh position={[0, -0.08, 0.38]}>
        <sphereGeometry args={[0.065, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Faction label */}
      <Text
        position={[0, 0.65, 0]}
        fontSize={0.19}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000000"
      >
        {FACTION_NAMES[faction]}
      </Text>
    </group>
  );
}

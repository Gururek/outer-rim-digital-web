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
    shipId: string;
  };
  isLocalPlayer: boolean;
}

// Ship class by ID — drives mesh geometry
const SHIP_CLASS: Record<string, 'fighter' | 'freighter' | 'heavy' | 'gunship'> = {
  porax38:          'fighter',
  jumpmaster:       'fighter',
  aggressor:        'fighter',
  lancer:           'fighter',
  g9_rigger:        'freighter',
  hwk290:           'freighter',
  gx1_short_hauler: 'freighter',
  yt1300:           'freighter',
  yt2400:           'freighter',
  vcx100:           'freighter',
  yv666:            'heavy',
  heavy_duty_lifter:'heavy',
  auzituck:         'heavy',
  edgehawk:         'heavy',
  firespray:        'gunship',
};

export default function PlayerShip({ playerData, isLocalPlayer }: Props) {
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

  const color   = isLocalPlayer ? '#00ff88' : '#ffaa00';
  const emissive= isLocalPlayer ? '#00ff44' : '#ff8800';
  const cls     = SHIP_CLASS[playerData.shipId] ?? 'freighter';

  return (
    <group ref={groupRef} position={[node.position[0], node.position[1] + 0.8, node.position[2]]}>
      <ShipMesh cls={cls} color={color} emissive={emissive} />

      {/* Engine glow */}
      <mesh position={[0, -0.15, 0.35]}>
        <sphereGeometry args={[0.09, 7, 7]} />
        <meshBasicMaterial color={isLocalPlayer ? '#88ffcc' : '#ffcc44'} />
      </mesh>

      {/* Player name label */}
      <Text
        position={[0, 0.75, 0]}
        fontSize={0.22}
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

// ─── Ship mesh geometries ─────────────────────────────────────────────────────

const MAT_PROPS = {
  metalness: 0.85,
  roughness: 0.15,
  emissiveIntensity: 0.4,
};

function ShipMesh({ cls, color, emissive }: { cls: string; color: string; emissive: string }) {
  const mat = <meshStandardMaterial color={color} emissive={emissive} {...MAT_PROPS} />;
  const matFlat = <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={0.25} metalness={0.7} roughness={0.3} />;

  if (cls === 'fighter') {
    // Narrow swept-wing interceptor
    return (
      <>
        {/* Fuselage */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.15, 0.9, 3, 1]} />
          {mat}
        </mesh>
        {/* Port wing */}
        <mesh position={[-0.32, 0, 0.12]} rotation={[0.15, 0.25, 0.08]}>
          <boxGeometry args={[0.38, 0.04, 0.22]} />
          {matFlat}
        </mesh>
        {/* Starboard wing */}
        <mesh position={[0.32, 0, 0.12]} rotation={[-0.15, -0.25, -0.08]}>
          <boxGeometry args={[0.38, 0.04, 0.22]} />
          {matFlat}
        </mesh>
      </>
    );
  }

  if (cls === 'freighter') {
    // Flat saucer hull with forward cockpit pod
    return (
      <>
        {/* Main disc hull */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.48, 0.18, 8, 1]} />
          {mat}
        </mesh>
        {/* Cockpit bump */}
        <mesh position={[0, 0.14, -0.22]}>
          <sphereGeometry args={[0.18, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {mat}
        </mesh>
        {/* Engine block */}
        <mesh position={[0, -0.04, 0.3]}>
          <boxGeometry args={[0.24, 0.1, 0.18]} />
          {matFlat}
        </mesh>
      </>
    );
  }

  if (cls === 'gunship') {
    // Firespray: oval hull + angled rear stabilizer fins
    return (
      <>
        {/* Oval hull */}
        <mesh scale={[1, 0.6, 1.4]}>
          <sphereGeometry args={[0.32, 8, 6]} />
          {mat}
        </mesh>
        {/* Fin port */}
        <mesh position={[-0.3, 0.1, 0.25]} rotation={[0, 0.3, 0.5]}>
          <boxGeometry args={[0.1, 0.4, 0.25]} />
          {matFlat}
        </mesh>
        {/* Fin starboard */}
        <mesh position={[0.3, 0.1, 0.25]} rotation={[0, -0.3, -0.5]}>
          <boxGeometry args={[0.1, 0.4, 0.25]} />
          {matFlat}
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0, -0.48]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.14, 0.28, 4]} />
          {mat}
        </mesh>
      </>
    );
  }

  // heavy: boxy cargo hauler with raised bridge
  return (
    <>
      {/* Main cargo hull */}
      <mesh>
        <boxGeometry args={[0.58, 0.28, 0.72]} />
        {mat}
      </mesh>
      {/* Bridge / cockpit block */}
      <mesh position={[0, 0.22, -0.22]}>
        <boxGeometry args={[0.28, 0.18, 0.28]} />
        {mat}
      </mesh>
      {/* Engine nacelles */}
      <mesh position={[-0.22, -0.07, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.22, 6]} />
        {matFlat}
      </mesh>
      <mesh position={[0.22, -0.07, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.22, 6]} />
        {matFlat}
      </mesh>
    </>
  );
}

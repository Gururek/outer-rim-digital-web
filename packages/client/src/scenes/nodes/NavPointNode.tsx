import { useCallback, useState } from 'react';
import { Float, Text } from '@react-three/drei';
import type { MapNode } from '@outer-rim/shared';
import { useGameStore } from '../../stores/gameStore';
import { getConnectedNodes } from '@outer-rim/shared';

interface Props {
  node: MapNode;
  onMoveConfirm?: (nodeId: number) => void;
}

export default function NavPointNode({ node, onMoveConfirm }: Props) {
  const [hovered, setHovered] = useState(false);

  const phase = useGameStore(s => s.phase);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players = useGameStore(s => s.players);

  const myPlayer = players.get(mySessionId);
  const isMyTurn = activePlayerId === mySessionId;
  const canMove = phase === 'ACTION' && isMyTurn && onMoveConfirm != null;

  const isReachable = canMove && myPlayer ? (() => {
    const connected = getConnectedNodes(myPlayer.currentNodeId);
    return connected.some(n => n.id === node.id);
  })() : false;

  const handleClick = useCallback(() => {
    if (isReachable && onMoveConfirm) {
      onMoveConfirm(node.id);
    }
  }, [isReachable, onMoveConfirm, node.id]);

  const isMaelstrom = node.type === 'MAELSTROM';
  const baseColor = isMaelstrom ? '#440044' : '#334455';
  const ringColor = isReachable ? (hovered ? '#ffd700' : '#00ff88')
    : isMaelstrom ? '#8800aa' : '#4488ff';

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
      <group position={node.position}>
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

import { useMemo } from 'react';
import * as THREE from 'three';
import type { MapNode } from '@outer-rim/shared';

interface Props { nodes: MapNode[]; }

// Each hyperspace lane: a bright core tube + a wider additive glow halo.
function LaneMesh({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const curve = useMemo(() => new THREE.LineCurve3(from, to), []);
  return (
    <group>
      {/* Bright core */}
      <mesh>
        <tubeGeometry args={[curve, 1, 0.022, 4, false]} />
        <meshBasicMaterial
          color="#88aaff"
          transparent opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Soft outer glow */}
      <mesh>
        <tubeGeometry args={[curve, 1, 0.1, 4, false]} />
        <meshBasicMaterial
          color="#1144cc"
          transparent opacity={0.10}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function HyperspaceLines({ nodes }: Props) {
  const pairs = useMemo(() => {
    const seen = new Set<string>();
    const out: [THREE.Vector3, THREE.Vector3][] = [];
    for (const node of nodes) {
      for (const connId of node.connectedNodeIds) {
        const key = [node.id, connId].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);
        const target = nodes.find(n => n.id === connId);
        if (target) {
          out.push([
            new THREE.Vector3(...node.position),
            new THREE.Vector3(...target.position),
          ]);
        }
      }
    }
    return out;
  }, [nodes]);

  return (
    <group>
      {pairs.map(([a, b], i) => <LaneMesh key={i} from={a} to={b} />)}
    </group>
  );
}

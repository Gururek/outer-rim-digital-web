import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import type { MapNode } from '@outer-rim/shared';

interface Props {
  nodes: MapNode[];
}

export default function HyperspaceLines({ nodes }: Props) {
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const pairs: [MapNode, MapNode][] = [];

    for (const node of nodes) {
      for (const connId of node.connectedNodeIds) {
        const key = [node.id, connId].sort().join('-');
        if (seen.has(key)) continue;
        seen.add(key);

        const target = nodes.find(n => n.id === connId);
        if (target) {
          pairs.push([node, target]);
        }
      }
    }
    return pairs;
  }, [nodes]);

  return (
    <group>
      {edges.map(([a, b], i) => (
        <Line
          key={i}
          points={[
            new THREE.Vector3(...a.position),
            new THREE.Vector3(...b.position),
          ]}
          color="#2255aa"
          opacity={0.25}
          transparent
          depthWrite={false}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

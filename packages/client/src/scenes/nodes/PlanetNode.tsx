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

// ─── Per-planet visual identity ───────────────────────────────────────────────
interface PlanetConfig {
  type: 'desert' | 'ocean' | 'jungle' | 'volcanic' | 'earthlike' | 'industrial' | 'swamp' | 'barren' | 'anomaly' | 'rocky';
  primary: string;
  secondary: string;
  polar?: string;
  glow: string;
  hasRing: boolean;
  ringColor?: string;
  ringTilt?: number;
  size: number;
}

const PLANET_CONFIGS: Record<string, PlanetConfig> = {
  tatooine:    { type: 'desert',     primary: '#c8823a', secondary: '#e8b574', polar: '#f5d8a0',  glow: '#f5a020', hasRing: false, size: 1.1 },
  rodia:       { type: 'jungle',     primary: '#1a5c28', secondary: '#2e8040', polar: '#3a9048',  glow: '#3cc87a', hasRing: false, size: 0.9 },
  ryloth:      { type: 'rocky',      primary: '#8a6428', secondary: '#a88040', polar: '#b89050',  glow: '#d4900a', hasRing: false, size: 1.0 },
  mon_cala:    { type: 'ocean',      primary: '#1055a0', secondary: '#1878cc', polar: '#c8e0f8',  glow: '#4da6ff', hasRing: false, size: 1.15 },
  geonosis:    { type: 'volcanic',   primary: '#6a2208', secondary: '#9a3a10', polar: '#c05020',  glow: '#e05555', hasRing: true, ringColor: '#7a3015', ringTilt: 0.45, size: 1.0 },
  corellia:    { type: 'earthlike',  primary: '#1a6030', secondary: '#2880a8', polar: '#d8eef8',  glow: '#4da6ff', hasRing: false, size: 1.1 },
  ord_mantell: { type: 'industrial', primary: '#4a4e5a', secondary: '#6a7080', polar: '#888ea0',  glow: '#8099b8', hasRing: false, size: 1.0 },
  nal_hutta:   { type: 'swamp',      primary: '#4a7010', secondary: '#608020', polar: '#789030',  glow: '#3cc87a', hasRing: false, size: 1.3 },
  kessel:      { type: 'barren',     primary: '#1a1820', secondary: '#2e2a38', polar: '#3a3648',  glow: '#8099b8', hasRing: true, ringColor: '#2e2838', ringTilt: 0.2, size: 0.85 },
  maelstrom:   { type: 'anomaly',    primary: '#2a0a40', secondary: '#4a0a68', polar: '#6a0a90',  glow: '#e05555', hasRing: false, size: 1.0 },
};

const DEFAULT_CONFIG: PlanetConfig = {
  type: 'rocky', primary: '#3a4055', secondary: '#5a607a', glow: '#8099b8', hasRing: false, size: 1.0,
};

// ─── Canvas texture per planet type ──────────────────────────────────────────
function buildTexture(cfg: PlanetConfig): THREE.CanvasTexture {
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = cfg.primary;
  ctx.fillRect(0, 0, W, H);

  const { type, primary, secondary, polar = '#ffffff' } = cfg;

  if (type === 'desert') {
    for (let i = 0; i < 28; i++) {
      const y = Math.random() * H;
      const a = 0.06 + Math.random() * 0.12;
      ctx.fillStyle = i % 3 === 0 ? secondary : polar;
      ctx.globalAlpha = a;
      ctx.fillRect(0, y, W, 3 + Math.random() * 10);
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'ocean') {
    // Deep trenches
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = secondary;
      ctx.globalAlpha = 0.08 + Math.random() * 0.12;
      ctx.fillRect(0, Math.random() * H, W, 2 + Math.random() * 8);
    }
    // Polar ice caps
    const capH = H * 0.15;
    const iceGrad = ctx.createLinearGradient(0, 0, 0, capH);
    iceGrad.addColorStop(0, polar);
    iceGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, W, capH);
    const bottomGrad = ctx.createLinearGradient(0, H - capH, 0, H);
    bottomGrad.addColorStop(0, 'transparent');
    bottomGrad.addColorStop(1, polar);
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, H - capH, W, capH);
    // Cloud wisps
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.06 + Math.random() * 0.10;
      const y = capH + Math.random() * (H - capH * 2);
      ctx.fillRect(Math.random() * W * 0.3, y, W * (0.3 + Math.random() * 0.5), 4 + Math.random() * 10);
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'jungle' || type === 'swamp') {
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = i % 4 === 0 ? '#1a3010' : secondary;
      ctx.globalAlpha = 0.07 + Math.random() * 0.18;
      const r = 10 + Math.random() * 50;
      ctx.beginPath();
      ctx.ellipse(Math.random() * W, Math.random() * H, r, r * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'volcanic') {
    // Lava veins
    for (let i = 0; i < 18; i++) {
      ctx.strokeStyle = i % 3 === 0 ? '#ff6600' : '#cc3300';
      ctx.globalAlpha = 0.15 + Math.random() * 0.25;
      ctx.lineWidth = 1 + Math.random() * 3;
      ctx.beginPath();
      let x = Math.random() * W, y = Math.random() * H;
      ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'earthlike') {
    // Continental masses
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#1a6030';
      ctx.globalAlpha = 0.5 + Math.random() * 0.3;
      const cx = Math.random() * W, cy = Math.random() * H;
      const rx = 30 + Math.random() * 80, ry = 20 + Math.random() * 50;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cloud layer
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.05 + Math.random() * 0.10;
      ctx.fillRect(Math.random() * W, Math.random() * H, 30 + Math.random() * 120, 4 + Math.random() * 12);
    }
    // Polar caps
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = polar;
    ctx.fillRect(0, 0, W, H * 0.1);
    ctx.fillRect(0, H * 0.9, W, H * 0.1);
    ctx.globalAlpha = 1;
  }

  if (type === 'industrial') {
    // City grid pattern
    ctx.strokeStyle = '#aabbcc';
    for (let i = 0; i < 25; i++) {
      ctx.globalAlpha = 0.05 + Math.random() * 0.10;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const x = Math.random() * W;
      ctx.moveTo(x, 0); ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      ctx.globalAlpha = 0.04 + Math.random() * 0.08;
      const y = Math.random() * H;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }
    // City light dots
    ctx.fillStyle = '#ffdd88';
    for (let i = 0; i < 60; i++) {
      ctx.globalAlpha = 0.1 + Math.random() * 0.3;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'barren') {
    // Craters
    for (let i = 0; i < 20; i++) {
      const r = 4 + Math.random() * 20;
      ctx.strokeStyle = '#444460';
      ctx.globalAlpha = 0.15 + Math.random() * 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'anomaly') {
    // Swirling energy patterns
    for (let i = 0; i < 15; i++) {
      const grad = ctx.createRadialGradient(
        Math.random() * W, Math.random() * H, 0,
        Math.random() * W, Math.random() * H, 40 + Math.random() * 80,
      );
      grad.addColorStop(0, '#cc44ff');
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.08 + Math.random() * 0.15;
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }

  if (type === 'rocky') {
    for (let i = 0; i < 22; i++) {
      ctx.fillStyle = i % 2 === 0 ? secondary : '#8a8090';
      ctx.globalAlpha = 0.06 + Math.random() * 0.12;
      ctx.fillRect(0, Math.random() * H, W, 2 + Math.random() * 8);
    }
    ctx.globalAlpha = 1;
  }

  return new THREE.CanvasTexture(canvas);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlanetNode({ node, isReachable, onMoveConfirm }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const anomRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const cfg = PLANET_CONFIGS[node.planetId] ?? DEFAULT_CONFIG;

  const texture = useMemo(() => buildTexture(cfg), [node.planetId]);

  const handleClick = useCallback(() => {
    if (isReachable && onMoveConfirm) onMoveConfirm(node.id);
  }, [isReachable, onMoveConfirm, node.id]);

  const R = cfg.size;
  const ringColor   = isReachable ? (hovered ? '#ffd700' : '#00ff88') : cfg.glow;
  const ringOpacity = isReachable ? 0.9 : 0.45;

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * (cfg.type === 'anomaly' ? 0.25 : 0.08);
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.12;
    if (glowRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.05;
      glowRef.current.scale.setScalar(isReachable ? pulse : 1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = isReachable
        ? 0.14 + Math.sin(Date.now() * 0.004) * 0.04 : 0;
    }
    if (anomRef.current) {
      anomRef.current.rotation.y -= delta * 0.3;
      (anomRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.08 + Math.sin(Date.now() * 0.002) * 0.04;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0} floatIntensity={0.25}>
      <group position={node.position}>

        {/* Reachable pulse glow sphere */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[R * 1.32, 24, 24]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Planet sphere */}
        <mesh
          ref={meshRef}
          castShadow
          onClick={handleClick}
          onPointerOver={() => isReachable && setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[R, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={0.75} metalness={0.05} />
        </mesh>

        {/* Atmosphere haze */}
        <mesh>
          <sphereGeometry args={[R * 1.08, 24, 24]} />
          <meshBasicMaterial
            color={cfg.glow}
            transparent
            opacity={isReachable ? 0.18 : 0.06}
            depthWrite={false}
          />
        </mesh>

        {/* Anomaly outer energy ring */}
        {cfg.type === 'anomaly' && (
          <mesh ref={anomRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R * 1.7, 0.08, 8, 64]} />
            <meshBasicMaterial color="#cc44ff" transparent opacity={0.1} depthWrite={false} />
          </mesh>
        )}

        {/* Optional debris / asteroid ring */}
        {cfg.hasRing && (
          <mesh
            ref={ringRef}
            rotation={[Math.PI / 2 + (cfg.ringTilt ?? 0.3), 0, 0]}
          >
            <torusGeometry args={[R * 1.65, 0.06, 8, 96]} />
            <meshBasicMaterial
              color={cfg.ringColor ?? cfg.secondary}
              transparent
              opacity={0.55}
            />
          </mesh>
        )}

        {/* Orbital highlight ring (always present, colored by reachable state) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[R * 1.45, 0.025, 8, 64]} />
          <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity} />
        </mesh>

        {/* Planet name */}
        <Text
          position={[0, -R * 1.55, 0]}
          fontSize={0.36}
          color={isReachable ? '#00ff88' : 'var(--ck-text, #9eb8cc)'}
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.name}
        </Text>

        {/* Contact class pips */}
        {node.contactSpaces.length > 0 && (
          <Html position={[0, R + 0.5, 0]} center>
            <div style={S.pipRow}>
              {node.contactSpaces.map((cs, i) => (
                <span key={i} style={{ ...S.pip, background: PIP_COLORS[cs.class] }} />
              ))}
            </div>
          </Html>
        )}

      </group>
    </Float>
  );
}

const PIP_COLORS: Record<string, string> = {
  WHITE:  '#cccccc',
  GREEN:  '#3cc87a',
  YELLOW: '#f5a020',
  ORANGE: '#e07020',
};

const S: Record<string, React.CSSProperties> = {
  pipRow: {
    display: 'flex',
    gap: 3,
    padding: '2px 5px',
    background: 'rgba(6,13,24,.6)',
    borderRadius: 4,
    border: '1px solid rgba(255,255,255,.1)',
  },
  pip: {
    display: 'inline-block',
    width: 7,
    height: 7,
    borderRadius: '50%',
    border: '1px solid rgba(0,0,0,.4)',
  },
};

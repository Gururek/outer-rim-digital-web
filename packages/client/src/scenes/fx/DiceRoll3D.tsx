import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import * as THREE from 'three';
import gsap from 'gsap';

interface DiceResult {
  player: number;
  patrol: number;
}

function Die({
  position,
  color,
  settled,
}: {
  position: [number, number, number];
  color: string;
  settled: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const spinRef = useRef({ x: 7 + Math.random() * 5, y: 11 + Math.random() * 6, z: 4 + Math.random() * 4 });

  useFrame((_, delta) => {
    if (!meshRef.current || settled) return;
    meshRef.current.rotation.x += spinRef.current.x * delta;
    meshRef.current.rotation.y += spinRef.current.y * delta;
    meshRef.current.rotation.z += spinRef.current.z * delta;
  });

  useEffect(() => {
    if (settled && meshRef.current) {
      gsap.to(meshRef.current.rotation, {
        x: Math.PI / 5,
        y: Math.PI / 4,
        z: 0,
        duration: 0.55,
        ease: 'back.out(1.7)',
      });
    }
  }, [settled]);

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.58, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.35}
        metalness={0.7}
        roughness={0.18}
      />
    </mesh>
  );
}

export default function DiceRoll3D() {
  const cinematic = useGameStore(s => s.cinematic);
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(false);
  const [result, setResult] = useState<DiceResult | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isDice =
    cinematic.active &&
    (cinematic.type === 'DICE_ROLLED' ||
      (cinematic.type === 'COMBAT_RESULT' && cinematic.payload.rolls != null));

  useEffect(() => {
    if (!isDice) return;

    const rolls = cinematic.payload.rolls as Array<{ totalDamage: number }> | undefined;
    if (rolls && rolls.length >= 2) {
      setResult({ player: rolls[0].totalDamage, patrol: rolls[1].totalDamage });
    }
    setSettled(false);
    setMounted(true);

    const t = setTimeout(() => setSettled(true), 1400);
    return () => clearTimeout(t);
  }, [isDice, cinematic.type]);

  useEffect(() => {
    if (!cinematic.active && mounted) {
      const wrap = wrapRef.current;
      if (wrap) {
        gsap.to(wrap, {
          opacity: 0, duration: 0.3,
          onComplete: () => { setMounted(false); setResult(null); },
        });
      }
    }
  }, [cinematic.active, mounted]);

  if (!mounted) return null;

  return (
    <div ref={wrapRef} style={S.wrap}>
      <Canvas camera={{ position: [0, 0, 3.8], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 3, 3]} intensity={1.8} color="#4da6ff" />
        <pointLight position={[-3, -2, 2]} intensity={0.9} color="#f5a020" />
        <Die position={[-1.0, 0, 0]} color="#4da6ff" settled={settled} />
        <Die position={[1.0, 0, 0]} color="#e05555" settled={settled} />
      </Canvas>
      <div style={S.labels}>
        <span style={S.labelLeft}>YOU</span>
        <span style={S.labelRight}>PATROL</span>
      </div>
      {result && settled && (
        <div style={S.score}>
          <span style={{ color: 'var(--ck-accent)' }}>{result.player}</span>
          <span style={S.vs}>vs</span>
          <span style={{ color: 'var(--ck-red)' }}>{result.patrol}</span>
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: {
    position: 'fixed',
    bottom: 292,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 220,
    height: 110,
    zIndex: 190,
    pointerEvents: 'none',
  },
  labels: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 18px',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 7,
    letterSpacing: '.1em',
    color: 'var(--ck-dim)',
  },
  labelLeft: { color: 'var(--ck-accent)' },
  labelRight: { color: 'var(--ck-red)' },
  score: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 13,
    letterSpacing: '.1em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  vs: {
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.08em',
  },
};

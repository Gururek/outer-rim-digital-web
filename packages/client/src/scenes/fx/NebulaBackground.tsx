import { useMemo } from 'react';
import { CatmullRomCurve3, Vector3, CanvasTexture, AdditiveBlending } from 'three';

// Outer arc node positions in order: left arm → apex → right arm
const ARC_POINTS: [number, number, number][] = [
  [-10,   0,  3   ],  // Nal Hutta
  [-11.5, 0, -1   ],  // Nav Dorn
  [-10.5, 0, -5   ],  // Kessel
  [-7.5,  0, -8.5 ],  // Nav Esk
  [-4.5,  0, -10.5],  // Tatooine
  [-1.5,  0, -11.5],  // Ryloth
  [ 2,    0, -11  ],  // Nav Aurek
  [ 5,    0, -9.5 ],  // Geonosis
  [ 8.5,  0, -7   ],  // Nav Besh
  [11,    0, -3   ],  // Mon Cala
  [10.5,  0,  1.5 ],  // Rodia
];

function makeNebulaTexture(): CanvasTexture {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;

  // Deep void base
  const bg = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
  bg.addColorStop(0, '#0a0520');
  bg.addColorStop(1, '#000308');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Purple nebula — top-center (arch apex zone)
  const p1 = ctx.createRadialGradient(size * 0.5, size * 0.15, 0, size * 0.5, size * 0.15, size * 0.42);
  p1.addColorStop(0,   'rgba(100,30,160,0.55)');
  p1.addColorStop(0.5, 'rgba( 60,20,100,0.25)');
  p1.addColorStop(1,   'rgba(  0, 0,  0,0)');
  ctx.fillStyle = p1;
  ctx.fillRect(0, 0, size, size);

  // Teal nebula — right quadrant
  const p2 = ctx.createRadialGradient(size * 0.8, size * 0.45, 0, size * 0.8, size * 0.45, size * 0.35);
  p2.addColorStop(0,   'rgba(20,80,120,0.5)');
  p2.addColorStop(0.5, 'rgba(10,50, 90,0.2)');
  p2.addColorStop(1,   'rgba( 0, 0,  0,0)');
  ctx.fillStyle = p2;
  ctx.fillRect(0, 0, size, size);

  // Rose nebula — left quadrant
  const p3 = ctx.createRadialGradient(size * 0.18, size * 0.4, 0, size * 0.18, size * 0.4, size * 0.32);
  p3.addColorStop(0,   'rgba(120,20,80,0.45)');
  p3.addColorStop(0.5, 'rgba( 80,10,50,0.20)');
  p3.addColorStop(1,   'rgba(  0, 0, 0,0)');
  ctx.fillStyle = p3;
  ctx.fillRect(0, 0, size, size);

  // Deterministic star scatter
  const rng = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < 2200; i++) {
    const sx = rng(i * 1.1) * size;
    const sy = rng(i * 2.7) * size;
    const sr = rng(i * 3.9) * 1.4 + 0.3;
    const br = rng(i * 5.2);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(br * 0.65 + 0.1).toFixed(2)})`;
    ctx.fill();
  }

  return new CanvasTexture(c);
}

function makeCloudTexture(r: number, g: number, b: number): CanvasTexture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0,   `rgba(${r},${g},${b},0.3)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.1)`);
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new CanvasTexture(c);
}

export default function NebulaBackground() {
  const nebulaTexture = useMemo(makeNebulaTexture, []);
  const purpleCloud   = useMemo(() => makeCloudTexture(80, 20, 140), []);
  const tealCloud     = useMemo(() => makeCloudTexture(20, 70, 130), []);

  const archCurve = useMemo(() => {
    const pts = ARC_POINTS.map(([x, , z]) => new Vector3(x, 0.05, z));
    return new CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }, []);

  return (
    <group>
      {/* Nebula floor — large textured plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -4]}>
        <planeGeometry args={[30, 22]} />
        <meshBasicMaterial map={nebulaTexture} transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* Arch guide tube — the lane border */}
      <mesh>
        <tubeGeometry args={[archCurve, 120, 0.18, 8, false]} />
        <meshBasicMaterial color="#3a6da8" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Arch glow — wider additive halo */}
      <mesh>
        <tubeGeometry args={[archCurve, 120, 0.55, 8, false]} />
        <meshBasicMaterial color="#1a4488" transparent opacity={0.08} blending={AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Purple nebula cloud — arch interior, left-center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-3, -0.2, -7]}>
        <planeGeometry args={[15, 11]} />
        <meshBasicMaterial map={purpleCloud} transparent blending={AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Teal nebula cloud — right inner region */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, -0.2, -4]}>
        <planeGeometry args={[11, 9]} />
        <meshBasicMaterial map={tealCloud} transparent blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

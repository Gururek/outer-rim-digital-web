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

// Deterministic random helper
const rng = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };

function makeNebulaTexture(): CanvasTexture {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d')!;

  // Deep void base — rich blue-black
  const bg = ctx.createRadialGradient(size * 0.5, size * 0.6, 0, size * 0.5, size * 0.5, size * 0.8);
  bg.addColorStop(0,   '#060d22');
  bg.addColorStop(0.7, '#020508');
  bg.addColorStop(1,   '#000204');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Purple-violet nebula — arch apex / top area (Ryloth, Tatooine quadrant)
  const p1 = ctx.createRadialGradient(size * 0.48, size * 0.12, 0, size * 0.48, size * 0.12, size * 0.52);
  p1.addColorStop(0,   'rgba(110,25,185,0.65)');
  p1.addColorStop(0.4, 'rgba( 70,15,120,0.35)');
  p1.addColorStop(0.8, 'rgba( 30, 5, 60,0.12)');
  p1.addColorStop(1,   'rgba(  0, 0,  0,0)');
  ctx.fillStyle = p1;
  ctx.fillRect(0, 0, size, size);

  // Teal-blue nebula — Mon Cala / right side
  const p2 = ctx.createRadialGradient(size * 0.82, size * 0.42, 0, size * 0.82, size * 0.42, size * 0.42);
  p2.addColorStop(0,   'rgba(20,90,155,0.60)');
  p2.addColorStop(0.5, 'rgba(12,55,105,0.28)');
  p2.addColorStop(1,   'rgba( 0, 0,  0,0)');
  ctx.fillStyle = p2;
  ctx.fillRect(0, 0, size, size);

  // Crimson-rose nebula — Nal Hutta / left side
  const p3 = ctx.createRadialGradient(size * 0.14, size * 0.38, 0, size * 0.14, size * 0.38, size * 0.36);
  p3.addColorStop(0,   'rgba(140,20,70,0.55)');
  p3.addColorStop(0.5, 'rgba( 90,10,45,0.25)');
  p3.addColorStop(1,   'rgba(  0, 0, 0,0)');
  ctx.fillStyle = p3;
  ctx.fillRect(0, 0, size, size);

  // Amber-orange nebula — Geonosis / lower right (warm dust clouds)
  const p4 = ctx.createRadialGradient(size * 0.70, size * 0.72, 0, size * 0.70, size * 0.72, size * 0.30);
  p4.addColorStop(0,   'rgba(180,80,15,0.45)');
  p4.addColorStop(0.5, 'rgba(120,45, 8,0.20)');
  p4.addColorStop(1,   'rgba(  0, 0, 0,0)');
  ctx.fillStyle = p4;
  ctx.fillRect(0, 0, size, size);

  // Deep-indigo cloud — center/interior (Corellian / Ord Mantell zone)
  const p5 = ctx.createRadialGradient(size * 0.50, size * 0.55, 0, size * 0.50, size * 0.55, size * 0.28);
  p5.addColorStop(0,   'rgba(30,15,80,0.45)');
  p5.addColorStop(0.6, 'rgba(15, 8,45,0.18)');
  p5.addColorStop(1,   'rgba( 0, 0, 0,0)');
  ctx.fillStyle = p5;
  ctx.fillRect(0, 0, size, size);

  // Vivid blue-white star cluster — top right (Mon Cala / Geonosis arc area)
  const p6 = ctx.createRadialGradient(size * 0.75, size * 0.22, 0, size * 0.75, size * 0.22, size * 0.18);
  p6.addColorStop(0,   'rgba(180,210,255,0.40)');
  p6.addColorStop(0.5, 'rgba(100,140,220,0.15)');
  p6.addColorStop(1,   'rgba(  0,  0,  0,0)');
  ctx.fillStyle = p6;
  ctx.fillRect(0, 0, size, size);

  // Dense star scatter — two brightness classes
  for (let i = 0; i < 3200; i++) {
    const sx = rng(i * 1.1 + 0.5) * size;
    const sy = rng(i * 2.7 + 1.3) * size;
    const sr = rng(i * 3.9 + 2.1) * 1.5 + 0.25;
    const br = rng(i * 5.2 + 3.7);
    const warm = rng(i * 7.3) > 0.8;  // 20% stars have warm tint
    const r = warm ? Math.floor(255) : Math.floor(220 + br * 35);
    const g = warm ? Math.floor(220 + br * 20) : Math.floor(220 + br * 35);
    const b = warm ? Math.floor(180 + br * 20) : 255;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(br * 0.72 + 0.12).toFixed(2)})`;
    ctx.fill();
  }

  // Bright star glints (few very bright)
  for (let i = 0; i < 40; i++) {
    const sx = rng(i * 11.3 + 99) * size;
    const sy = rng(i * 13.7 + 88) * size;
    const sr = rng(i * 17.1 + 44) * 1.0 + 1.0;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${(rng(i * 23) * 0.3 + 0.7).toFixed(2)})`;
    ctx.fill();
    // Cross-flare
    ctx.strokeStyle = `rgba(200,220,255,0.35)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(sx - sr * 3, sy); ctx.lineTo(sx + sr * 3, sy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy - sr * 3); ctx.lineTo(sx, sy + sr * 3); ctx.stroke();
  }

  return new CanvasTexture(c);
}

function makeCloudTexture(
  r: number, g: number, b: number,
  noiseSeeds = 8,
): CanvasTexture {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx2 = c.getContext('2d')!;
  ctx2.clearRect(0, 0, size, size);

  // Radial core
  const grad = ctx2.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0,   `rgba(${r},${g},${b},0.42)`);
  grad.addColorStop(0.35,`rgba(${r},${g},${b},0.22)`);
  grad.addColorStop(0.7, `rgba(${r},${g},${b},0.08)`);
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx2.fillStyle = grad;
  ctx2.fillRect(0, 0, size, size);

  // Additional noise blobs for organic cloud look
  for (let i = 0; i < noiseSeeds; i++) {
    const cx = rng(i * 3.7 + 1) * size;
    const cy = rng(i * 5.1 + 2) * size;
    const cr = rng(i * 7.9 + 3) * (size * 0.3) + size * 0.05;
    const ca = rng(i * 11.3 + 4) * 0.18 + 0.04;
    const g2 = ctx2.createRadialGradient(cx, cy, 0, cx, cy, cr);
    g2.addColorStop(0,   `rgba(${r},${g},${b},${ca.toFixed(2)})`);
    g2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx2.fillStyle = g2;
    ctx2.fillRect(0, 0, size, size);
  }

  return new CanvasTexture(c);
}

export default function NebulaBackground() {
  const nebulaTexture  = useMemo(makeNebulaTexture, []);
  const purpleCloud    = useMemo(() => makeCloudTexture( 90,  20, 160, 10), []);
  const tealCloud      = useMemo(() => makeCloudTexture( 18,  85, 160, 8 ), []);
  const amberCloud     = useMemo(() => makeCloudTexture(200,  80,  12, 7 ), []);
  const roseCloud      = useMemo(() => makeCloudTexture(160,  20,  80, 6 ), []);
  const blueGlowCloud  = useMemo(() => makeCloudTexture(100, 150, 255, 5 ), []);

  const archCurve = useMemo(() => {
    const pts = ARC_POINTS.map(([x, , z]) => new Vector3(x, 0.05, z));
    return new CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }, []);

  return (
    <group>
      {/* ── Nebula floor — main textured plane ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, -4]}>
        <planeGeometry args={[32, 24]} />
        <meshBasicMaterial map={nebulaTexture} transparent opacity={0.92} depthWrite={false} />
      </mesh>

      {/* ── Arch guide tube — galactic lane border ── */}
      <mesh>
        <tubeGeometry args={[archCurve, 120, 0.20, 8, false]} />
        <meshBasicMaterial color="#4a7ec0" transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Arch glow — wide additive halo */}
      <mesh>
        <tubeGeometry args={[archCurve, 120, 0.70, 8, false]} />
        <meshBasicMaterial color="#2255aa" transparent opacity={0.11} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Arch outer diffuse fringe */}
      <mesh>
        <tubeGeometry args={[archCurve, 120, 1.60, 8, false]} />
        <meshBasicMaterial color="#113366" transparent opacity={0.04} blending={AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* ── Nebula cloud layers — additive blending for volumetric feel ── */}

      {/* Purple — arch interior, upper-center (Ryloth/Tatooine arc) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, -0.18, -8.5]}>
        <planeGeometry args={[18, 13]} />
        <meshBasicMaterial map={purpleCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.9} />
      </mesh>

      {/* Teal — right inner region (Mon Cala / Corellia side) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.5, -0.14, -5.5]}>
        <planeGeometry args={[14, 11]} />
        <meshBasicMaterial map={tealCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.85} />
      </mesh>

      {/* Amber/orange — lower-right (Geonosis dust cloud) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.2]} position={[5.0, -0.10, -9.5]}>
        <planeGeometry args={[12, 9]} />
        <meshBasicMaterial map={amberCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.75} />
      </mesh>

      {/* Rose — left (Nal Hutta / Kessel region) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.15]} position={[-7.5, -0.12, -4.0]}>
        <planeGeometry args={[13, 10]} />
        <meshBasicMaterial map={roseCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.70} />
      </mesh>

      {/* Blue-white — Mon Cala star cluster (upper right arc) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8.5, 0.05, -4.5]}>
        <planeGeometry args={[9, 7]} />
        <meshBasicMaterial map={blueGlowCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.60} />
      </mesh>

      {/* Second purple layer — offset for depth (slightly above floor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0.3]} position={[1.0, 0.02, -10.5]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial map={purpleCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.50} />
      </mesh>

      {/* Teal mid-section cloud — center (Ord Mantell zone) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.4]} position={[0.5, -0.06, -1.5]}>
        <planeGeometry args={[10, 8]} />
        <meshBasicMaterial map={tealCloud} transparent blending={AdditiveBlending} depthWrite={false} opacity={0.45} />
      </mesh>
    </group>
  );
}

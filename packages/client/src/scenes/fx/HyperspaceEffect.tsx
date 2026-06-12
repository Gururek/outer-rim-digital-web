import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import gsap from 'gsap';

export default function HyperspaceEffect() {
  const cinematic = useGameStore(s => s.cinematic);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const liveRef = useRef(false);

  useEffect(() => {
    if (cinematic.active && cinematic.type === 'HYPERSPACE_TRAVEL') {
      setMounted(true);
    }
  }, [cinematic.active, cinematic.type]);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d')!;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const stars = Array.from({ length: 260 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 15 + Math.random() * 60,
      speed: 5 + Math.random() * 12,
      alpha: 0.4 + Math.random() * 0.6,
      lw: 0.5 + Math.random() * 1.5,
    }));

    liveRef.current = true;
    const t0 = performance.now();
    const DUR = 2300;

    gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: 0.12 });

    const frame = (now: number) => {
      if (!liveRef.current) return;
      const p = Math.min((now - t0) / DUR, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep-space background, sweeps in and out
      const bgA = p < 0.5 ? p * 2 * 0.9 : p < 0.76 ? 0.9 : (1 - (p - 0.76) / 0.24) * 0.9;
      ctx.fillStyle = `rgba(6,13,24,${bgA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bright blue-white flash at peak
      if (p > 0.6 && p < 0.82) {
        const fp = Math.sin(((p - 0.6) / 0.22) * Math.PI);
        ctx.fillStyle = `rgba(150,205,255,${fp * 0.48})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Star streaks: grow radially from centre
      for (const s of stars) {
        let stretch: number, a: number;
        if (p < 0.6) {
          stretch = p / 0.6;
          a = s.alpha * (p < 0.1 ? p / 0.1 : 1);
        } else if (p < 0.76) {
          stretch = 1;
          a = s.alpha;
        } else {
          const r = (p - 0.76) / 0.24;
          stretch = 1 - r;
          a = s.alpha * (1 - r);
        }
        if (a < 0.02) continue;

        const far = s.dist + s.speed * 70 * stretch;
        const near = s.dist;
        const cos = Math.cos(s.angle), sin = Math.sin(s.angle);
        const x1 = cx + near * cos, y1 = cy + near * sin;
        const x2 = cx + far * cos, y2 = cy + far * sin;

        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, `rgba(77,166,255,0)`);
        g.addColorStop(0.55, `rgba(180,222,255,${a * 0.75})`);
        g.addColorStop(1, `rgba(255,255,255,${a})`);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.lw;
        ctx.stroke();
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        gsap.to(wrap, {
          opacity: 0, duration: 0.3,
          onComplete: () => setMounted(false),
        });
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      liveRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={wrapRef}
      style={{ position: 'fixed', inset: 0, zIndex: 150, pointerEvents: 'none', opacity: 0 }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import { MAP_NODES } from '@outer-rim/shared';
import gsap from 'gsap';
import type { Vector3 } from 'three';

const WIDE = { x: 0, y: 20, z: 5 };

// Per-faction approach angle for Phase 2 of HYPERSPACE_TRAVEL.
// Offsets are relative to the destination node position.
const APPROACH: Record<string, { ox: number; oy: number; oz: number; dur: number }> = {
  IMPERIAL:  { ox:  0.0, oy: 14, oz: 3.0, dur: 0.65 }, // steep overhead — authoritative
  REBEL:     { ox:  3.5, oy:  7, oz: 3.5, dur: 0.50 }, // banking side sweep — dynamic
  HUTT:      { ox: -2.0, oy:  5, oz: 4.5, dur: 0.75 }, // low and slow — ponderous
  SYNDICATE: { ox: -3.0, oy:  6, oz: 3.0, dur: 0.50 }, // sharp far-side bank — aggressive
  NONE:      { ox:  0.0, oy:  6, oz: 3.5, dur: 0.40 }, // quick flyby for nav points
  MAELSTROM: { ox:  0.0, oy:  3, oz: 5.0, dur: 0.80 }, // eerie low pass
};

interface Props {
  controlsRef: React.MutableRefObject<{ enabled: boolean; target: Vector3; update(): void } | null>;
}


export default function CameraAnimator({ controlsRef }: Props) {
  const { camera } = useThree();
  const cinematic = useGameStore(s => s.cinematic);
  const lastActiveRef = useRef(false);

  useEffect(() => {
    const wasActive = lastActiveRef.current;
    lastActiveRef.current = cinematic.active;

    if (!cinematic.active || wasActive) return;

    // ── HYPERSPACE TRAVEL ───────────────────────────────────────────────────
    if (cinematic.type === 'HYPERSPACE_TRAVEL') {
      gsap.killTweensOf(camera.position);

      const path = (cinematic.payload.path as number[]) ?? [];
      const destId = path[path.length - 1];
      const destNode = MAP_NODES.find(n => n.id === destId);

      if (controlsRef.current) controlsRef.current.enabled = false;

      const resetControls = () => {
        const ctrl = controlsRef.current;
        if (ctrl) { ctrl.target.set(0, 0, -4); ctrl.update(); ctrl.enabled = true; }
      };

      const tl = gsap.timeline();

      if (destNode) {
        const [dx, , dz] = destNode.position;

        // Phase 1 (0–0.85s, hidden under HyperspaceEffect): dive to surface
        tl.to(camera.position, {
          x: dx, y: 5, z: dz + 3,
          duration: 0.85,
          ease: 'power2.in',
          onUpdate: () => camera.lookAt(dx, 0, dz),
        });

        // Phase 2: faction-specific approach shot
        const apKey = destNode.type === 'MAELSTROM' ? 'MAELSTROM' : (destNode.factionOwner ?? 'NONE');
        const ap = APPROACH[apKey] ?? APPROACH.NONE;
        tl.to(camera.position, {
          x: dx + ap.ox, y: ap.oy, z: dz + ap.oz,
          duration: ap.dur,
          ease: 'power1.out',
          onUpdate: () => camera.lookAt(dx, 0, dz),
        });

        // Phase 3 (1.5–3.0s, fully visible): dramatic pull-back to galaxy overview
        tl.to(camera.position, {
          x: WIDE.x, y: WIDE.y, z: WIDE.z,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => camera.lookAt(0, 0, -4),
          onComplete: resetControls,
        });
      } else {
        tl.to(camera.position, {
          x: WIDE.x, y: WIDE.y, z: WIDE.z,
          duration: 1.5,
          ease: 'power2.out',
          delay: 0.85,
          onUpdate: () => camera.lookAt(0, 0, -4),
          onComplete: resetControls,
        });
      }
    }

    // ── FORCED_PATROL — swing to player's node, then pull back ─────────────
    if (cinematic.type === 'FORCED_PATROL') {
      gsap.killTweensOf(camera.position);
      const { players, mySessionId } = useGameStore.getState();
      const myPlayer = players.get(mySessionId);
      const node = myPlayer ? MAP_NODES.find(n => n.id === myPlayer.currentNodeId) : null;

      if (controlsRef.current) controlsRef.current.enabled = false;
      const resetControls = () => {
        const ctrl = controlsRef.current;
        if (ctrl) { ctrl.target.set(0, 0, -4); ctrl.update(); ctrl.enabled = true; }
      };

      const tl = gsap.timeline();

      if (node) {
        const [nx, , nz] = node.position;
        tl.to(camera.position, {
          x: nx, y: 8, z: nz + 5,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: () => camera.lookAt(nx, 0, nz),
        });
        tl.to(camera.position, {
          x: WIDE.x, y: WIDE.y, z: WIDE.z,
          duration: 1.4,
          ease: 'power2.inOut',
          delay: 0.5,
          onUpdate: () => camera.lookAt(0, 0, -4),
          onComplete: resetControls,
        });
      } else {
        tl.to(camera.position, { x: WIDE.x, y: WIDE.y, z: WIDE.z, duration: 1.2, ease: 'power2.out', onComplete: resetControls });
      }
    }

    // ── SHIP DESTROYED — screen shake ───────────────────────────────────────
    if (cinematic.type === 'SHIP_DESTROYED') {
      gsap.killTweensOf(camera.position);
      if (controlsRef.current) controlsRef.current.enabled = false;

      const ox = camera.position.x, oy = camera.position.y, oz = camera.position.z;
      const S = 0.45;
      const tl = gsap.timeline({
        onComplete: () => {
          const ctrl = controlsRef.current;
          if (ctrl) {
            ctrl.target.set(0, 0, -4);
            ctrl.update();
            ctrl.enabled = true;
          }
        },
      });

      for (let i = 0; i < 9; i++) {
        tl.to(camera.position, {
          x: ox + (Math.random() - 0.5) * S * 2,
          y: oy + (Math.random() - 0.5) * S * 0.6,
          z: oz + (Math.random() - 0.5) * S * 2,
          duration: 0.07,
          ease: 'none',
        });
      }
      tl.to(camera.position, { x: ox, y: oy, z: oz, duration: 0.25, ease: 'power2.out' });
    }
  }, [cinematic.active, cinematic.type]);

  return null;
}

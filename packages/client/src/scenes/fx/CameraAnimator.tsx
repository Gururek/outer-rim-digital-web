import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGameStore } from '../../stores/gameStore';
import { MAP_NODES } from '@outer-rim/shared';
import gsap from 'gsap';
import type { Vector3 } from 'three';

interface Props {
  controlsRef: React.MutableRefObject<{ enabled: boolean; target: Vector3; update(): void } | null>;
}

// Stable overview camera position (matches GalaxyMap initial camera + orbit target)
const WIDE = { x: 0, y: 20, z: 5 };

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

        // Phase 2 (0.85–1.5s, overlay fading): planet approach shot — medium orbit
        tl.to(camera.position, {
          x: dx + 1.5, y: 9, z: dz + 4.5,
          duration: 0.65,
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

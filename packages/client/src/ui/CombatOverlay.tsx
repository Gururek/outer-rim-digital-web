import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGameStore } from '../stores/gameStore';

type Stage = 'intercept' | 'rolling' | 'result' | null;

function Die({ position, color, settled }: {
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
      gsap.to(meshRef.current.rotation, { x: Math.PI / 5, y: Math.PI / 4, z: 0, duration: 0.55, ease: 'back.out(1.7)' });
    }
  }, [settled]);

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.58, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} metalness={0.7} roughness={0.18} />
    </mesh>
  );
}

const FACTION_COLOR: Record<string, string> = {
  IMPERIAL:  '#4488cc',
  REBEL:     '#f5a020',
  HUTT:      '#8bc34a',
  SYNDICATE: '#a855f7',
  NONE:      '#8099b8',
};

const FACTION_LABEL: Record<string, string> = {
  IMPERIAL:  'IMPERIAL PATROL',
  REBEL:     'REBEL PATROL',
  HUTT:      'HUTT CARTEL ENFORCER',
  SYNDICATE: 'SYNDICATE OPERATIVE',
  NONE:      'PATROL SHIP',
};

export default function CombatOverlay({ onDismiss }: { onDismiss: () => void }) {
  const cinematic   = useGameStore(s => s.cinematic);
  const mySessionId = useGameStore(s => s.mySessionId);
  const players     = useGameStore(s => s.players);

  const [stage,   setStage]   = useState<Stage>(null);
  const [settled, setSettled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isIntercept = cinematic.active && cinematic.type === 'FORCED_PATROL';
  const isCombat    = cinematic.active && cinematic.type === 'COMBAT_RESULT';

  const faction      = (cinematic.payload.faction as string | undefined) ?? 'NONE';
  const factionColor = FACTION_COLOR[faction] ?? FACTION_COLOR.NONE;

  const rolls     = cinematic.payload.rolls as Array<{ totalDamage: number }> | undefined;
  const winnerId  = cinematic.payload.winnerId as string | undefined;
  const playerWon = winnerId === mySessionId;
  const playerDmg = Number(cinematic.payload.attackerDmg ?? 0);
  const patrolDmg = Number(cinematic.payload.defenderDmg ?? 0);
  const pilot     = players.get(mySessionId)?.displayName ?? 'PILOT';

  // FORCED_PATROL intercept banner
  useEffect(() => {
    if (!isIntercept) return;
    setStage('intercept');
    const t = setTimeout(() => {
      if (wrapRef.current) gsap.to(wrapRef.current, { opacity: 0, duration: 0.35 });
      setTimeout(() => { setStage(null); onDismiss(); }, 400);
    }, 3500);
    return () => clearTimeout(t);
  }, [isIntercept, cinematic.type]);

  // COMBAT_RESULT sequence: rolling → result → auto-dismiss
  useEffect(() => {
    if (!isCombat) return;
    setStage('rolling');
    setSettled(false);
    const t1 = setTimeout(() => setSettled(true), 1400);
    const t2 = setTimeout(() => setStage('result'), 1900);
    const t3 = setTimeout(() => {
      if (wrapRef.current) gsap.to(wrapRef.current, { opacity: 0, duration: 0.35 });
      setTimeout(() => { setStage(null); onDismiss(); }, 400);
    }, 5800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isCombat, cinematic.type]);

  if (stage === null) return null;

  // ── INTERCEPT ──────────────────────────────────────────────────────────────
  if (stage === 'intercept') {
    return (
      <div ref={wrapRef} style={S.backdrop} onClick={onDismiss}>
        <div style={S.scanline} />
        <div style={{ ...S.interceptCard, borderColor: factionColor, boxShadow: `0 0 60px ${factionColor}33` }}>
          <div style={{ ...S.topBar, background: factionColor }} />
          <div style={S.interceptBody}>
            <div style={{ ...S.bigIcon, color: factionColor }}>⚠</div>
            <div style={{ ...S.interceptHeading, color: factionColor }}>PATROL INTERCEPT</div>
            <div style={{ ...S.interceptFaction, color: factionColor }}>{FACTION_LABEL[faction]}</div>
            <div style={S.interceptSub}>YOUR VESSEL HAS BEEN STOPPED</div>
            <div style={{ ...S.pulse, background: factionColor }} className="ck-anim-blink" />
          </div>
          <div style={{ ...S.topBar, background: factionColor }} />
        </div>
      </div>
    );
  }

  // ── COMBAT ─────────────────────────────────────────────────────────────────
  const resultColor = playerWon ? 'var(--ck-green)' : 'var(--ck-red)';

  return (
    <div
      ref={wrapRef}
      style={S.backdrop}
      onClick={stage === 'result' ? onDismiss : undefined}
    >
      <div style={S.scanline} />
      <div style={S.combatCard}>
        {/* Header bar */}
        <div style={S.combatHeader}>
          <div style={{ ...S.hbar, background: 'var(--ck-accent)' }} />
          <div style={S.combatTitle}>COMBAT SEQUENCE</div>
          <div style={{ ...S.hbar, background: 'var(--ck-red)' }} />
        </div>

        {/* Three-column combatants row */}
        <div style={S.row}>
          {/* Left — player */}
          <div style={S.combatant}>
            <div style={{ ...S.combatantRole, color: 'var(--ck-accent)' }}>PILOT</div>
            <div style={S.combatantName}>{pilot}</div>
            {stage === 'result' && (
              <div style={{ ...S.dmgChip, borderColor: 'var(--ck-accent)', background: 'rgba(77,166,255,.1)' }}>
                <span style={S.dmgLabel}>DMG DEALT</span>
                <span style={{ color: 'var(--ck-accent)', fontSize: '1rem', letterSpacing: '.05em' }}>{playerDmg}</span>
              </div>
            )}
          </div>

          {/* Centre — dice */}
          <div style={S.diceCol}>
            <div style={S.diceBox}>
              <Canvas camera={{ position: [0, 0, 3.8], fov: 50 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.35} />
                <pointLight position={[3, 3, 3]} intensity={1.8} color="#4da6ff" />
                <pointLight position={[-3, -2, 2]} intensity={0.9} color="#f5a020" />
                <Die position={[-1.0, 0, 0]} color="#4da6ff" settled={settled} />
                <Die position={[ 1.0, 0, 0]} color="#e05555" settled={settled} />
              </Canvas>
            </div>
            <div style={S.diceLabels}>
              <span style={{ color: 'var(--ck-accent)', fontSize: 8 }}>YOU</span>
              <span style={{ color: 'var(--ck-dim)',    fontSize: 8 }}>vs</span>
              <span style={{ color: 'var(--ck-red)',   fontSize: 8 }}>PATROL</span>
            </div>
            {stage === 'result' && rolls && rolls.length >= 2 && (
              <div style={S.scores}>
                <span style={{ color: 'var(--ck-accent)' }}>{rolls[0].totalDamage}</span>
                <span style={S.scoreVs}>vs</span>
                <span style={{ color: 'var(--ck-red)' }}>{rolls[1].totalDamage}</span>
              </div>
            )}
          </div>

          {/* Right — patrol */}
          <div style={S.combatant}>
            <div style={{ ...S.combatantRole, color: 'var(--ck-red)' }}>PATROL</div>
            <div style={S.combatantName}>{FACTION_LABEL[faction]}</div>
            {stage === 'result' && (
              <div style={{ ...S.dmgChip, borderColor: 'var(--ck-red)', background: 'rgba(224,85,85,.1)' }}>
                <span style={S.dmgLabel}>DMG DEALT</span>
                <span style={{ color: 'var(--ck-red)', fontSize: '1rem', letterSpacing: '.05em' }}>{patrolDmg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Result banner */}
        {stage === 'result' && (
          <>
            <div style={{ ...S.verdict, color: resultColor, borderColor: resultColor, boxShadow: `0 0 30px ${resultColor}22` }}>
              {playerWon ? '⚡ VICTORY' : '✖ DEFEAT'}
            </div>
            <div style={S.dismissHint}>CLICK TO DISMISS</div>
          </>
        )}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(6,13,24,.88)',
    fontFamily: "'Share Tech Mono', monospace",
    animation: 'ck-fade .3s ease',
  },
  scanline: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',
  },
  topBar: { height: 3, opacity: .85 },

  // ── Intercept ──────────────────────────────────────────────────────────
  interceptCard: {
    position: 'relative',
    zIndex: 1,
    background: 'var(--ck-panel)',
    border: '1px solid',
    borderRadius: 6,
    minWidth: 360,
    overflow: 'hidden',
    animation: 'ck-fade .35s ease',
  },
  interceptBody: {
    padding: '2.5rem 3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
  },
  bigIcon: { fontSize: '2.2rem' },
  interceptHeading: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1rem',
    letterSpacing: '.2em',
  },
  interceptFaction: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.75rem',
    letterSpacing: '.14em',
  },
  interceptSub: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.5rem',
    color: 'var(--ck-dim)',
    letterSpacing: '.14em',
    marginTop: '.3rem',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginTop: '.5rem',
  },

  // ── Combat card ─────────────────────────────────────────────────────────
  combatCard: {
    position: 'relative',
    zIndex: 1,
    width: 560,
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    overflow: 'hidden',
    animation: 'ck-fade .35s ease',
  },
  combatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '.9rem 1.4rem',
    borderBottom: '1px solid var(--ck-border)',
  },
  hbar: { flex: 1, height: 2, borderRadius: 1, opacity: .75 },
  combatTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.65rem',
    color: 'var(--ck-val)',
    letterSpacing: '.2em',
    whiteSpace: 'nowrap',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.4rem',
    gap: 8,
  },
  combatant: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  combatantRole: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.55rem',
    letterSpacing: '.14em',
  },
  combatantName: {
    color: 'var(--ck-val)',
    fontSize: '.75rem',
    textAlign: 'center',
    letterSpacing: '.04em',
  },
  dmgChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '5px 12px',
    border: '1px solid',
    borderRadius: 4,
    gap: 2,
    animation: 'ck-fade .3s ease',
  },
  dmgLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 7,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
  },
  diceCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: '0 0 170px',
  },
  diceBox: { width: 170, height: 85 },
  diceLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 14px',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: '.1em',
  },
  scores: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.15rem',
    letterSpacing: '.1em',
    animation: 'ck-fade .3s ease',
  },
  scoreVs: {
    fontSize: '.65rem',
    color: 'var(--ck-dim)',
    letterSpacing: '.08em',
  },
  verdict: {
    margin: '0 1.4rem .8rem',
    padding: '.7rem',
    textAlign: 'center',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.3rem',
    letterSpacing: '.3em',
    border: '1px solid',
    borderRadius: 4,
    animation: 'ck-fade .35s ease',
  },
  dismissHint: {
    textAlign: 'center',
    padding: '.65rem',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
    borderTop: '1px solid var(--ck-border)',
  },
};

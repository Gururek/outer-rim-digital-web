import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

function getVolumes() {
  const s = useSettingsStore.getState();
  return { sfx: s.sfxVolume, music: s.musicVolume };
}

// ─── Web Audio context ────────────────────────────────────────────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ─── One-shot SFX ─────────────────────────────────────────────────────────────
function synth(opts: {
  freq: number; freq2?: number; dur: number;
  type?: OscillatorType; vol?: number; attack?: number; delay?: number;
}) {
  const { freq, freq2, dur, type = 'sine', vol = 0.12, attack = 0.01, delay = 0 } = opts;
  const sfxVol = getVolumes().sfx;
  if (sfxVol <= 0) return;
  const ctx = getCtx();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (freq2 != null) osc.frequency.linearRampToValueAtTime(freq2, t + dur);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(vol * sfxVol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  click:        () => synth({ freq: 440, dur: 0.05, type: 'square', vol: 0.08 }),
  confirm:      () => { synth({ freq: 528, dur: 0.12, vol: 0.1 }); synth({ freq: 660, dur: 0.15, vol: 0.10, delay: 0.1 }); },
  tabSwitch:    () => synth({ freq: 380, freq2: 480, dur: 0.08, vol: 0.07 }),
  alert:        () => { synth({ freq: 220, dur: 0.25, type: 'sawtooth', vol: 0.1 }); synth({ freq: 200, dur: 0.25, type: 'sawtooth', vol: 0.08, delay: 0.28 }); },
  warpStart:    () => { synth({ freq: 80, freq2: 600, dur: 0.9, type: 'sawtooth', vol: 0.15, attack: 0.05 }); synth({ freq: 200, freq2: 1200, dur: 0.85, vol: 0.08, attack: 0.1, delay: 0.1 }); },
  warpEnd:      () => { synth({ freq: 800, freq2: 60, dur: 0.7, vol: 0.18 }); synth({ freq: 60, dur: 0.5, vol: 0.2, attack: 0.02, delay: 0.3 }); },
  diceRoll:     () => { for (let i = 0; i < 6; i++) synth({ freq: 120 + Math.random() * 300, dur: 0.04 + Math.random() * 0.06, type: 'square', vol: 0.05 + Math.random() * 0.06, delay: i * 0.07 }); },
  combatHit:    () => { synth({ freq: 80, freq2: 40, dur: 0.35, type: 'sawtooth', vol: 0.2, attack: 0.005 }); synth({ freq: 600, freq2: 200, dur: 0.2, type: 'square', vol: 0.08, attack: 0.005 }); },
  combatMiss:   () => synth({ freq: 350, freq2: 150, dur: 0.25, vol: 0.1 }),
  creditsGain:  () => { synth({ freq: 523, dur: 0.1, vol: 0.1 }); synth({ freq: 659, dur: 0.1, vol: 0.1, delay: 0.1 }); synth({ freq: 784, dur: 0.15, vol: 0.12, delay: 0.2 }); },
  fameGain:     () => { synth({ freq: 440, dur: 0.12, vol: 0.1 }); synth({ freq: 550, dur: 0.12, vol: 0.1, delay: 0.12 }); synth({ freq: 660, dur: 0.12, vol: 0.1, delay: 0.24 }); synth({ freq: 880, dur: 0.22, vol: 0.14, delay: 0.36 }); },
  error:        () => { synth({ freq: 180, dur: 0.18, type: 'sawtooth', vol: 0.12 }); synth({ freq: 160, dur: 0.18, type: 'sawtooth', vol: 0.10, delay: 0.2 }); },
  contactReveal:() => { synth({ freq: 300, freq2: 600, dur: 0.4, vol: 0.1, attack: 0.05 }); synth({ freq: 600, dur: 0.6, vol: 0.08, attack: 0.1, delay: 0.35 }); },
};

// ─── Procedural faction music (Web Audio drones, no MP3s required) ────────────
// Each track: slow-moving harmonic drone built from 4 detuned oscillators + LFO
// tremolo. Faction identity comes from root note choice, mode, and timbre.

interface DroneSpec { freq: number; type: OscillatorType; gain: number; detune: number; }
interface DroneTrack { oscs: DroneSpec[]; lfoRate: number; lfoDepth: number; }

const DRONE_TRACKS: Record<string, DroneTrack> = {
  MENU: {  // Open 5th drone — neutral, spacious
    oscs: [
      { freq:  55.00, type: 'sine',     gain: 0.060, detune:   0 }, // A1
      { freq:  82.41, type: 'sine',     gain: 0.040, detune:  -5 }, // E2 (5th)
      { freq: 110.00, type: 'sine',     gain: 0.030, detune:   7 }, // A2
      { freq: 164.81, type: 'triangle', gain: 0.020, detune:  -3 }, // E3
    ],
    lfoRate: 0.10, lfoDepth: 0.30,
  },
  IMPERIAL: {  // Sawtooth minor — dark, ominous, machine-like
    oscs: [
      { freq:  41.20, type: 'sawtooth', gain: 0.055, detune:   0 }, // E1
      { freq:  55.00, type: 'sawtooth', gain: 0.040, detune:  -8 }, // A1
      { freq:  61.74, type: 'sawtooth', gain: 0.030, detune:   5 }, // Bb1 (tension)
      { freq:  82.41, type: 'sine',     gain: 0.035, detune:   0 }, // E2
    ],
    lfoRate: 0.04, lfoDepth: 0.45,
  },
  REBEL: {  // Major 6th — hopeful, organic, human
    oscs: [
      { freq:  49.00, type: 'sine',     gain: 0.055, detune:   0 }, // G1
      { freq:  73.42, type: 'sine',     gain: 0.040, detune:  -3 }, // D2 (5th)
      { freq:  98.00, type: 'sine',     gain: 0.030, detune:   5 }, // G2
      { freq: 123.47, type: 'triangle', gain: 0.025, detune:  -5 }, // B2 (maj 3rd)
    ],
    lfoRate: 0.18, lfoDepth: 0.20,
  },
  HUTT: {  // Chromatic tritone — exotic, sinister, alien
    oscs: [
      { freq:  55.00, type: 'sawtooth', gain: 0.050, detune:   0 }, // A1
      { freq:  65.41, type: 'sawtooth', gain: 0.040, detune:  10 }, // C2 (m3)
      { freq:  77.78, type: 'sawtooth', gain: 0.030, detune:  -8 }, // Eb2 (tritone)
      { freq: 116.54, type: 'triangle', gain: 0.025, detune:   5 }, // Bb2
    ],
    lfoRate: 0.07, lfoDepth: 0.38,
  },
  SYNDICATE: {  // Square minor 7th — jazzy, tense, underground
    oscs: [
      { freq:  36.71, type: 'square',   gain: 0.045, detune:   0 }, // D1
      { freq:  55.00, type: 'square',   gain: 0.035, detune: -10 }, // A1
      { freq:  65.41, type: 'sawtooth', gain: 0.030, detune:   8 }, // C2 (m7)
      { freq:  87.31, type: 'triangle', gain: 0.025, detune:  -5 }, // F2
    ],
    lfoRate: 0.13, lfoDepth: 0.30,
  },
};

type DroneState = { key: string; gain: GainNode; oscs: OscillatorNode[]; lfo: OscillatorNode };
let _drone: DroneState | null = null;

function stopDrone(fadeMs = 1500) {
  if (!_drone) return;
  const { gain, oscs, lfo } = _drone;
  try {
    const ctx = getCtx();
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + Math.max(fadeMs / 1000, 0.05));
  } catch { /* context may be suspended */ }
  const cleanup = () => {
    oscs.forEach(o => { try { o.stop(); o.disconnect(); } catch {} });
    try { lfo.stop(); lfo.disconnect(); } catch {}
    try { gain.disconnect(); } catch {}
  };
  if (fadeMs > 0) setTimeout(cleanup, fadeMs + 150);
  else cleanup();
  _drone = null;
}

function startDrone(key: string, vol: number) {
  if (_drone?.key === key) return;
  if (vol <= 0) { stopDrone(); return; }
  const cfg = DRONE_TRACKS[key];
  if (!cfg) return;

  stopDrone(1200);

  const ctx = getCtx();
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.0);
  master.connect(ctx.destination);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = cfg.lfoRate;
  lfoGain.gain.value = cfg.lfoDepth * vol * 0.4;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  const oscs: OscillatorNode[] = cfg.oscs.map(spec => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = spec.type;
    osc.frequency.value = spec.freq;
    osc.detune.value = spec.detune;
    g.gain.value = spec.gain;
    osc.connect(g);
    g.connect(master);
    osc.start();
    return osc;
  });

  _drone = { key, gain: master, oscs, lfo };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const cinematic   = useGameStore(s => s.cinematic);
  const phase       = useGameStore(s => s.phase);
  const patrolNodes = useGameStore(s => s.patrolNodes);
  const musicVolume = useSettingsStore(s => s.musicVolume);
  const prevType    = useRef('');

  // SFX triggers on cinematic events
  useEffect(() => {
    if (!cinematic.active) return;
    if (cinematic.type === prevType.current) return;
    prevType.current = cinematic.type;
    switch (cinematic.type) {
      case 'HYPERSPACE_TRAVEL':   sfx.warpStart();      break;
      case 'FORCED_PATROL':       sfx.alert();          break;
      case 'SHIP_DESTROYED':      sfx.combatHit();      break;
      case 'CONTACT_REVEALED':    sfx.contactReveal();  break;
      case 'DICE_ROLLED':         sfx.diceRoll();       break;
      case 'COMBAT_RESULT': {
        const p = cinematic.payload as { rolls?: Array<{ totalDamage: number }> };
        (p.rolls?.[0]?.totalDamage ?? 0) > 0 ? sfx.combatHit() : sfx.combatMiss();
        break;
      }
      case 'CARGO_DELIVERED':  sfx.creditsGain(); break;
      case 'JOB_RESULT':
        (cinematic.payload as any).outcome === 'SUCCESS' ? sfx.fameGain() : sfx.combatMiss();
        break;
    }
  }, [cinematic.active, cinematic.type]);

  useEffect(() => { if (!cinematic.active) prevType.current = ''; }, [cinematic.active]);

  // Faction music — pick dominant faction patrol, fall back to MENU
  useEffect(() => {
    if (phase === 'WAITING_FOR_PLAYERS') return;
    const dominated = (Object.keys(patrolNodes) as string[])
      .filter(k => k !== 'NONE' && patrolNodes[k as keyof typeof patrolNodes] >= 0);
    const track = dominated.length > 0 ? dominated[0] : 'MENU';
    try { startDrone(track, musicVolume); } catch { /* ignore */ }
  }, [patrolNodes, phase, musicVolume]);

  // Ramp gain when volume slider changes without restarting the drone
  useEffect(() => {
    if (!_drone) return;
    try {
      const ctx = getCtx();
      _drone.gain.gain.cancelScheduledValues(ctx.currentTime);
      _drone.gain.gain.setTargetAtTime(musicVolume, ctx.currentTime, 0.3);
    } catch { /* ignore */ }
  }, [musicVolume]);

  useEffect(() => () => stopDrone(0), []);

  return sfx;
}

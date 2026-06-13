import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
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

// Tonal oscillator
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

// White noise burst (blaster crack, hologram static)
function noise(dur: number, vol: number = 0.15, filterFreq = 800, delay = 0) {
  const sfxVol = getVolumes().sfx;
  if (sfxVol <= 0) return;
  const ctx = getCtx();
  const t = ctx.currentTime + delay;
  const bufSize = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bpf = ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.value = filterFreq;
  bpf.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * sfxVol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  src.start(t);
  src.stop(t + dur + 0.05);
}

// FM synthesis — R2-D2 style wobbling chirp
function r2Chirp(baseFreq: number, targetFreq: number, wobbleHz: number, dur: number, vol = 0.12, delay = 0) {
  const sfxVol = getVolumes().sfx;
  if (sfxVol <= 0) return;
  const ctx = getCtx();
  const t = ctx.currentTime + delay;
  const carrier  = ctx.createOscillator();
  const mod      = ctx.createOscillator();
  const modGain  = ctx.createGain();
  const outGain  = ctx.createGain();
  carrier.type = 'square';
  carrier.frequency.setValueAtTime(baseFreq, t);
  carrier.frequency.linearRampToValueAtTime(targetFreq, t + dur);
  mod.type = 'sine';
  mod.frequency.value = wobbleHz;
  modGain.gain.value = baseFreq * 0.06;
  outGain.gain.setValueAtTime(0.001, t);
  outGain.gain.linearRampToValueAtTime(vol * sfxVol, t + 0.01);
  outGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  mod.connect(modGain);
  modGain.connect(carrier.frequency);
  carrier.connect(outGain);
  outGain.connect(ctx.destination);
  carrier.start(t);  carrier.stop(t + dur + 0.05);
  mod.start(t);      mod.stop(t + dur + 0.05);
}

// ─── Star Wars–tuned SFX ─────────────────────────────────────────────────────
export const sfx = {
  // R2-D2 short chirp
  click: () => r2Chirp(1100, 750, 40, 0.07, 0.09),

  // R2-D2 happy ascending sequence
  confirm: () => {
    r2Chirp(600,  1000, 28, 0.10, 0.10);
    r2Chirp(900,  1500, 55, 0.11, 0.10, 0.13);
    r2Chirp(1400, 1000, 38, 0.09, 0.09, 0.28);
  },

  // Sharp computer terminal blip
  tabSwitch: () => r2Chirp(1400, 1800, 0, 0.05, 0.06),

  // Imperial klaxon — two descending blasts
  alert: () => {
    synth({ freq: 1100, freq2: 550, dur: 0.28, type: 'sawtooth', vol: 0.14, attack: 0.01 });
    synth({ freq: 880,  freq2: 440, dur: 0.28, type: 'sawtooth', vol: 0.12, attack: 0.01, delay: 0.34 });
  },

  // Hyperdrive engage: low rumble → building whine
  warpStart: () => {
    synth({ freq: 55, freq2: 75,   dur: 0.7,  type: 'sine',     vol: 0.20, attack: 0.15 });
    synth({ freq: 200, freq2: 3200, dur: 1.05, type: 'sawtooth', vol: 0.13, attack: 0.05, delay: 0.28 });
    synth({ freq: 400, freq2: 6400, dur: 0.85, type: 'square',   vol: 0.06, attack: 0.10, delay: 0.50 });
  },

  // Hyperdrive cutout: whine drop → mechanical thud
  warpEnd: () => {
    synth({ freq: 3200, freq2: 80, dur: 0.45, type: 'sawtooth', vol: 0.15, attack: 0.005 });
    synth({ freq: 85,   dur: 0.40, type: 'sine', vol: 0.22, attack: 0.01, delay: 0.18 });
  },

  // Mechanical dice tumble
  diceRoll: () => {
    for (let i = 0; i < 8; i++) {
      synth({
        freq:  280 + Math.random() * 480,
        freq2: 180 + Math.random() * 280,
        dur:   0.03 + Math.random() * 0.04,
        type:  'square',
        vol:   0.05 + Math.random() * 0.05,
        delay: i * 0.055,
      });
    }
  },

  // Blaster shot: noise crack + descending sawtooth buzz ("pew")
  combatHit: () => {
    noise(0.04, 0.22, 2000);
    synth({ freq: 2200, freq2: 280, dur: 0.26, type: 'sawtooth', vol: 0.15, attack: 0.002, delay: 0.015 });
  },

  // Blaster graze / near miss
  combatMiss: () => {
    synth({ freq: 1800, freq2: 700, dur: 0.18, type: 'sawtooth', vol: 0.10, attack: 0.002 });
  },

  // Credits: bright ascending chime
  creditsGain: () => {
    synth({ freq: 659,  dur: 0.12, vol: 0.10 });
    synth({ freq: 784,  dur: 0.12, vol: 0.10, delay: 0.12 });
    synth({ freq: 1047, dur: 0.20, vol: 0.13, delay: 0.24 });
  },

  // Fame: triumphant fanfare (Star Wars motif rhythm: G4–C5–E5–G5 hold–C6)
  fameGain: () => {
    synth({ freq: 392,  dur: 0.13, vol: 0.12 });
    synth({ freq: 523,  dur: 0.13, vol: 0.12, delay: 0.15 });
    synth({ freq: 659,  dur: 0.13, vol: 0.13, delay: 0.30 });
    synth({ freq: 784,  dur: 0.30, vol: 0.17, delay: 0.45 });
    synth({ freq: 1047, dur: 0.40, vol: 0.15, delay: 0.77 });
  },

  // Error / short Imperial alarm
  error: () => {
    synth({ freq: 880, freq2: 440, dur: 0.22, type: 'sawtooth', vol: 0.12, attack: 0.005 });
  },

  // Hologram flicker + stabilise tone
  contactReveal: () => {
    noise(0.08, 0.10, 1200);
    synth({ freq: 1200, freq2: 600, dur: 0.35, vol: 0.09, attack: 0.02, delay: 0.09 });
    synth({ freq: 600,  dur: 0.55,  vol: 0.08, attack: 0.08, delay: 0.38 });
  },
};

// ─── Faction music via Howler ─────────────────────────────────────────────────
// Drop Star Wars MP3s in packages/client/public/audio/ to override CDN fallbacks:
//   MENU.mp3      → Star Wars Main Theme (John Williams)
//   IMPERIAL.mp3  → Imperial March (Darth Vader's Theme)
//   REBEL.mp3     → Battle of Yavin (X-Wings / Use the Force)
//   HUTT.mp3      → Cantina Band (Mad About Me)
//   SYNDICATE.mp3 → Duel of the Fates (Phantom Menace)
const LOCAL = (key: string) => `/audio/${key}.mp3`;

const CDN_FALLBACK: Record<string, string> = {
  MENU:      'https://archive.org/download/tvtunes_7011/Star%20Wars%20-%20Main%20Theme.mp3',
  IMPERIAL:  'https://archive.org/download/tvtunes_12997/Star%20Wars%20-%20Imperial%20March.mp3',
  REBEL:     'https://archive.org/download/0413BinarySunsetAlternate_201707/0510%20The%20Battle%20Of%20Yavin%20(Launch%20From%20The%20Fourth%20Moon%20%20X-Wings%20Draw%20Fire%20%20Use%20The%20Force).mp3',
  HUTT:      'https://archive.org/download/cantina-band-star-wars/Cantina%20Band%20(Star%20Wars).mp3',
  SYNDICATE: 'https://archive.org/download/star-wars-episode-1-soundtrack-duel-of-the-fates/star-wars-episode-1-soundtrack-duel-of-the-fates.mp3',
};

const _howls: Partial<Record<string, Howl>> = {};

function getHowl(key: string): Howl {
  if (!_howls[key]) {
    _howls[key] = new Howl({
      // Local file takes priority; CDN is fallback
      src: [LOCAL(key), CDN_FALLBACK[key] ?? CDN_FALLBACK.MENU],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => { /* non-critical */ },
    });
  }
  return _howls[key]!;
}

let _currentTrack: string | null = null;

function crossfadeTo(key: string, vol: number) {
  const trackKey = CDN_FALLBACK[key] ? key : 'MENU';
  if (_currentTrack === trackKey) return;

  if (_currentTrack) {
    const old = getHowl(_currentTrack);
    old.fade(old.volume() as number, 0, 1500);
    setTimeout(() => old.pause(), 1600);
  }

  _currentTrack = trackKey;
  const next = getHowl(trackKey);
  next.volume(0);
  if (!(next as any).playing()) next.play();
  next.fade(0, vol, 1500);
}

function setMusicVolume(vol: number) {
  if (_currentTrack) {
    const h = _howls[_currentTrack];
    if ((h as any)?.playing()) h?.volume(vol);
  }
}

function stopAllMusic() {
  Object.values(_howls).forEach(h => h?.stop());
  _currentTrack = null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const cinematic   = useGameStore(s => s.cinematic);
  const phase       = useGameStore(s => s.phase);
  const patrolNodes = useGameStore(s => s.patrolNodes);
  const musicVolume = useSettingsStore(s => s.musicVolume);
  const prevType    = useRef('');

  useEffect(() => {
    if (!cinematic.active) return;
    if (cinematic.type === prevType.current) return;
    prevType.current = cinematic.type;
    switch (cinematic.type) {
      case 'HYPERSPACE_TRAVEL':  sfx.warpStart();      break;
      case 'FORCED_PATROL':      sfx.alert();          break;
      case 'SHIP_DESTROYED':     sfx.combatHit();      break;
      case 'CONTACT_REVEALED':   sfx.contactReveal();  break;
      case 'DICE_ROLLED':        sfx.diceRoll();       break;
      case 'COMBAT_RESULT': {
        const p = cinematic.payload as { rolls?: Array<{ totalDamage: number }> };
        (p.rolls?.[0]?.totalDamage ?? 0) > 0 ? sfx.combatHit() : sfx.combatMiss();
        break;
      }
      case 'CARGO_DELIVERED':    sfx.creditsGain();    break;
      case 'JOB_RESULT':
        (cinematic.payload as any).outcome === 'SUCCESS' ? sfx.fameGain() : sfx.combatMiss();
        break;
    }
  }, [cinematic.active, cinematic.type]);

  useEffect(() => { if (!cinematic.active) prevType.current = ''; }, [cinematic.active]);

  // Faction music — dominant patrol faction sets the track
  useEffect(() => {
    if (phase === 'WAITING_FOR_PLAYERS') return;
    if (musicVolume <= 0) { stopAllMusic(); return; }
    const dominated = (Object.keys(patrolNodes) as string[])
      .filter(k => k !== 'NONE' && patrolNodes[k as keyof typeof patrolNodes] >= 0);
    const track = dominated.length > 0 ? dominated[0] : 'MENU';
    try { crossfadeTo(track, musicVolume); } catch { /* ignore */ }
  }, [patrolNodes, phase, musicVolume]);

  useEffect(() => { setMusicVolume(musicVolume); }, [musicVolume]);

  useEffect(() => () => stopAllMusic(), []);

  return sfx;
}

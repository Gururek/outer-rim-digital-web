import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

// Get current volumes from settings store (reactive via getter to avoid hook hell)
function getVolumes() {
  const s = useSettingsStore.getState();
  return { sfx: s.sfxVolume, music: s.musicVolume };
}

// ─── Web Audio synthesis (no asset files required) ───────────────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') _ctx = new AudioContext();
  return _ctx;
}

function synth(opts: {
  freq: number;
  freq2?: number;
  dur: number;
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  delay?: number;
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

// ─── Synthesized sound effects ────────────────────────────────────────────────
export const sfx = {
  click: () => {
    synth({ freq: 440, dur: 0.05, type: 'square', vol: 0.08 });
  },
  confirm: () => {
    synth({ freq: 528, dur: 0.12, vol: 0.1 });
    synth({ freq: 660, dur: 0.15, vol: 0.10, delay: 0.1 });
  },
  tabSwitch: () => {
    synth({ freq: 380, freq2: 480, dur: 0.08, type: 'sine', vol: 0.07 });
  },
  alert: () => {
    synth({ freq: 220, dur: 0.25, type: 'sawtooth', vol: 0.1 });
    synth({ freq: 200, dur: 0.25, type: 'sawtooth', vol: 0.08, delay: 0.28 });
  },
  warpStart: () => {
    synth({ freq: 80, freq2: 600, dur: 0.9, type: 'sawtooth', vol: 0.15, attack: 0.05 });
    synth({ freq: 200, freq2: 1200, dur: 0.85, type: 'sine', vol: 0.08, attack: 0.1, delay: 0.1 });
  },
  warpEnd: () => {
    synth({ freq: 800, freq2: 60, dur: 0.7, type: 'sine', vol: 0.18, attack: 0.01 });
    synth({ freq: 60, dur: 0.5, type: 'sine', vol: 0.2, attack: 0.02, delay: 0.3 });
  },
  diceRoll: () => {
    for (let i = 0; i < 6; i++) {
      synth({
        freq: 120 + Math.random() * 300,
        dur: 0.04 + Math.random() * 0.06,
        type: 'square',
        vol: 0.05 + Math.random() * 0.06,
        delay: i * 0.07,
      });
    }
  },
  combatHit: () => {
    synth({ freq: 80, freq2: 40, dur: 0.35, type: 'sawtooth', vol: 0.2, attack: 0.005 });
    synth({ freq: 600, freq2: 200, dur: 0.2, type: 'square', vol: 0.08, attack: 0.005 });
  },
  combatMiss: () => {
    synth({ freq: 350, freq2: 150, dur: 0.25, type: 'sine', vol: 0.1 });
  },
  creditsGain: () => {
    synth({ freq: 523, dur: 0.1, vol: 0.1 });
    synth({ freq: 659, dur: 0.1, vol: 0.1, delay: 0.1 });
    synth({ freq: 784, dur: 0.15, vol: 0.12, delay: 0.2 });
  },
  fameGain: () => {
    synth({ freq: 440, dur: 0.12, vol: 0.1 });
    synth({ freq: 550, dur: 0.12, vol: 0.1, delay: 0.12 });
    synth({ freq: 660, dur: 0.12, vol: 0.1, delay: 0.24 });
    synth({ freq: 880, dur: 0.22, vol: 0.14, delay: 0.36 });
  },
  error: () => {
    synth({ freq: 180, dur: 0.18, type: 'sawtooth', vol: 0.12 });
    synth({ freq: 160, dur: 0.18, type: 'sawtooth', vol: 0.10, delay: 0.2 });
  },
  contactReveal: () => {
    synth({ freq: 300, freq2: 600, dur: 0.4, type: 'sine', vol: 0.1, attack: 0.05 });
    synth({ freq: 600, dur: 0.6, type: 'sine', vol: 0.08, attack: 0.1, delay: 0.35 });
  },
};

// ─── Howler stubs for file-based faction music ────────────────────────────────
// Audio files at /audio/*.mp3 — will silently do nothing until files are added.
const FACTION_MUSIC_URLS: Record<string, string> = {
  HUTT:      '/audio/music_hutt.mp3',
  SYNDICATE: '/audio/music_syndicate.mp3',
  IMPERIAL:  '/audio/music_imperial.mp3',
  REBEL:     '/audio/music_rebel.mp3',
  MENU:      '/audio/music_menu.mp3',
};

const _howls: Partial<Record<string, Howl>> = {};
function getFactionHowl(key: string): Howl {
  if (!_howls[key]) {
    _howls[key] = new Howl({
      src: [FACTION_MUSIC_URLS[key] ?? '/audio/music_menu.mp3'],
      loop: true,
      volume: getVolumes().music,
      html5: true,
      onloaderror: () => { /* silently ignore missing audio files */ },
    });
  }
  return _howls[key]!;
}

let _currentTrack: string | null = null;
function crossfadeTo(key: string) {
  if (_currentTrack === key) return;
  const musicVol = getVolumes().music;
  if (musicVol <= 0) return;
  if (_currentTrack) getFactionHowl(_currentTrack).fade(musicVol, 0, 1000);
  _currentTrack = key;
  const h = getFactionHowl(key);
  h.volume(0);
  h.play();
  h.fade(0, musicVol, 1200);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAudio() {
  const cinematic     = useGameStore(s => s.cinematic);
  const phase         = useGameStore(s => s.phase);
  const patrolNodes   = useGameStore(s => s.patrolNodes);
  const prevCinematic = useRef<string>('');

  // Cinematic sound triggers
  useEffect(() => {
    if (!cinematic.active) return;
    if (cinematic.type === prevCinematic.current) return;
    prevCinematic.current = cinematic.type;

    switch (cinematic.type) {
      case 'HYPERSPACE_TRAVEL':   sfx.warpStart();      break;
      case 'FORCED_PATROL':       sfx.alert();          break;
      case 'SHIP_DESTROYED':      sfx.combatHit();      break;
      case 'CONTACT_REVEALED':    sfx.contactReveal();  break;
      case 'DICE_ROLLED':         sfx.diceRoll();       break;
      case 'COMBAT_RESULT': {
        const payload = cinematic.payload as { rolls?: Array<{ totalDamage: number }> };
        if (payload.rolls && payload.rolls[0].totalDamage > 0) sfx.combatHit();
        else sfx.combatMiss();
        break;
      }
      case 'CARGO_DELIVERED':     sfx.creditsGain();    break;
      case 'JOB_RESULT':
        if ((cinematic.payload as any).outcome === 'SUCCESS') sfx.fameGain();
        else sfx.combatMiss();
        break;
    }
  }, [cinematic.active, cinematic.type]);

  // Reset previous track ref when cinematic clears
  useEffect(() => {
    if (!cinematic.active) prevCinematic.current = '';
  }, [cinematic.active]);

  // Faction music based on dominant patrol presence
  // (will silently do nothing until .mp3 files exist)
  useEffect(() => {
    if (phase === 'WAITING_FOR_PLAYERS') return;
    const dominated = (Object.keys(patrolNodes) as string[])
      .filter(k => k !== 'NONE' && patrolNodes[k as keyof typeof patrolNodes] >= 0);
    const track = dominated.length > 0 ? dominated[0] : 'MENU';
    try { crossfadeTo(track); } catch { /* ignore audio errors */ }
  }, [patrolNodes, phase]);

  return sfx;
}

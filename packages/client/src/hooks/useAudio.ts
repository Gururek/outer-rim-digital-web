import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

function getVolumes() {
  const s = useSettingsStore.getState();
  return { sfx: s.sfxVolume, music: s.musicVolume };
}

// ─── Web Audio context (SFX only) ─────────────────────────────────────────────
let _ctx: AudioContext | null = null;
function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') _ctx = new AudioContext();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

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

// ─── Faction music via Howler ─────────────────────────────────────────────────
// Kevin MacLeod (incompetech.com) — Licensed under Creative Commons: By Attribution 4.0
// http://creativecommons.org/licenses/by/4.0/
// Served via Internet Archive CDN (CORS: access-control-allow-origin: *)
const FACTION_TRACKS: Record<string, string> = {
  MENU:      'https://archive.org/download/Incompetech/mp3-royaltyfree/Atlantean%20Twilight.mp3',
  IMPERIAL:  'https://archive.org/download/Incompetech/mp3-royaltyfree/BlackVortex.mp3',
  REBEL:     'https://archive.org/download/Incompetech/mp3-royaltyfree/Achilles.mp3',
  HUTT:      'https://archive.org/download/Incompetech/mp3-royaltyfree/Baba%20Yaga.mp3',
  SYNDICATE: 'https://archive.org/download/Incompetech/mp3-royaltyfree/Apprehension.mp3',
  // NONE patrol uses MENU track
};

const _howls: Partial<Record<string, Howl>> = {};

function getHowl(key: string): Howl {
  if (!_howls[key]) {
    _howls[key] = new Howl({
      src: [FACTION_TRACKS[key] ?? FACTION_TRACKS.MENU],
      loop: true,
      volume: 0,
      html5: true,
      onloaderror: () => { /* silently ignore — music is non-critical */ },
    });
  }
  return _howls[key]!;
}

let _currentTrack: string | null = null;

function crossfadeTo(key: string, vol: number) {
  const trackKey = FACTION_TRACKS[key] ? key : 'MENU';
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

  // SFX on cinematic events
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

  // Faction music — play track matching dominant patrol
  useEffect(() => {
    if (phase === 'WAITING_FOR_PLAYERS') return;
    if (musicVolume <= 0) { stopAllMusic(); return; }
    const dominated = (Object.keys(patrolNodes) as string[])
      .filter(k => k !== 'NONE' && patrolNodes[k as keyof typeof patrolNodes] >= 0);
    const track = dominated.length > 0 ? dominated[0] : 'MENU';
    try { crossfadeTo(track, musicVolume); } catch { /* ignore */ }
  }, [patrolNodes, phase, musicVolume]);

  // Live volume update when slider moves
  useEffect(() => {
    setMusicVolume(musicVolume);
  }, [musicVolume]);

  useEffect(() => () => stopAllMusic(), []);

  return sfx;
}

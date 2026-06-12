import { create } from 'zustand';

const LS_KEY = 'outer-rim-settings';

function load(): { uiScale: number; sfxVolume: number; musicVolume: number } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { uiScale: 1.0, sfxVolume: 0.7, musicVolume: 0.18 };
}

function save(state: SettingsState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      uiScale: state.uiScale,
      sfxVolume: state.sfxVolume,
      musicVolume: state.musicVolume,
    }));
  } catch { /* ignore */ }
}

interface SettingsState {
  uiScale: number;    // 0.5 – 2.0, default 1.0
  sfxVolume: number;  // 0 – 1
  musicVolume: number;// 0 – 1

  setUiScale: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
}

const defaults = load();

export const useSettingsStore = create<SettingsState>((set) => ({
  uiScale: defaults.uiScale,
  sfxVolume: defaults.sfxVolume,
  musicVolume: defaults.musicVolume,

  setUiScale: (v) => set((s) => {
    const next = { ...s, uiScale: Math.round(v * 100) / 100 };
    save(next);
    return next;
  }),
  setSfxVolume: (v) => set((s) => {
    const next = { ...s, sfxVolume: Math.max(0, Math.min(1, Math.round(v * 100) / 100)) };
    save(next);
    return next;
  }),
  setMusicVolume: (v) => set((s) => {
    const next = { ...s, musicVolume: Math.max(0, Math.min(1, Math.round(v * 100) / 100)) };
    save(next);
    return next;
  }),
}));

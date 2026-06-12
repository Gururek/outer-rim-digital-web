import { useSettingsStore } from '../stores/settingsStore';

interface Props {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: Props) {
  const uiScale      = useSettingsStore(s => s.uiScale);
  const sfxVolume    = useSettingsStore(s => s.sfxVolume);
  const musicVolume  = useSettingsStore(s => s.musicVolume);
  const setUiScale   = useSettingsStore(s => s.setUiScale);
  const setSfxVolume = useSettingsStore(s => s.setSfxVolume);
  const setMusicVolume = useSettingsStore(s => s.setMusicVolume);

  return (
    <div style={S.backdrop} onClick={onClose}>
      <div style={S.panel} onClick={e => e.stopPropagation()}>
        {/* Title */}
        <div style={S.titleRow}>
          <span style={S.title}>SETTINGS</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* UI Scale */}
        <div style={S.group}>
          <div style={S.labelRow}>
            <span className="ck-label">UI SCALE</span>
            <span style={S.val}>{uiScale.toFixed(2)}x</span>
          </div>
          <Slider value={uiScale} min={0.5} max={2.0} step={0.05} onChange={setUiScale} />
          <div style={S.hint}>
            {uiScale <= 0.75 ? 'Compact — for 4K displays' :
             uiScale >= 1.5  ? 'Large — for small screens' :
             'Standard'}
          </div>
        </div>

        {/* SFX Volume */}
        <div style={S.group}>
          <div style={S.labelRow}>
            <span className="ck-label">SOUND EFFECTS</span>
            <span style={S.val}>{Math.round(sfxVolume * 100)}%</span>
          </div>
          <Slider value={sfxVolume} min={0} max={1} step={0.05} onChange={setSfxVolume} />
        </div>

        {/* Music Volume */}
        <div style={S.group}>
          <div style={S.labelRow}>
            <span className="ck-label">MUSIC</span>
            <span style={S.val}>{Math.round(musicVolume * 100)}%</span>
          </div>
          <Slider value={musicVolume} min={0} max={1} step={0.05} onChange={setMusicVolume} />
        </div>

        {/* Preset buttons */}
        <div style={S.presets}>
          <span className="ck-label" style={{ marginBottom: 4, display: 'block' }}>PRESETS</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={S.presetBtn} onClick={() => { setUiScale(1.25); setSfxVolume(0.6); setMusicVolume(0.15); }}>
              4K
            </button>
            <button style={S.presetBtn} onClick={() => { setUiScale(1.0); setSfxVolume(0.7); setMusicVolume(0.18); }}>
              1080p
            </button>
            <button style={S.presetBtn} onClick={() => { setUiScale(1.5); setSfxVolume(0.5); setMusicVolume(0.1); }}>
              COUCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({ value, min, max, step, onChange }: {
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={S.sliderWrap}>
      <div style={{ ...S.sliderTrack }}>
        <div style={{ ...S.sliderFill, width: `${pct}%` }} />
      </div>
      <input
        type="range"
        className="settings-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={S.sliderInput}
      />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Share Tech Mono', monospace",
  },
  panel: {
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 6,
    padding: '1.5rem',
    width: 340,
    maxWidth: '90vw',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 12,
    color: 'var(--ck-val)',
    letterSpacing: '.15em',
  },
  closeBtn: {
    background: 'none',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
    color: 'var(--ck-dim)',
    fontSize: 14,
    width: 26,
    height: 26,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: 1,
  },
  group: {
    marginBottom: '1rem',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  val: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: 'var(--ck-accent)',
  },
  hint: {
    fontSize: 8,
    color: 'var(--ck-dim)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  sliderWrap: {
    position: 'relative',
    height: 22,
    display: 'flex',
    alignItems: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0, right: 0,
    height: 4,
    borderRadius: 2,
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    background: 'var(--ck-accent)',
    borderRadius: 2,
    transition: 'width .1s ease',
  },
  sliderInput: {
    position: 'relative',
    width: '100%',
    height: 22,
    margin: 0,
    appearance: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    cursor: 'pointer',
    // Thumb styling via inline won't work; we use CSS-in-JS class trick
    // Instead we'll use the track fill approach — the native thumb is invisible
    zIndex: 1,
  },
  presets: {
    marginTop: '0.25rem',
  },
  presetBtn: {
    flex: 1,
    padding: '6px 8px',
    background: 'var(--ck-bg)',
    border: '1px solid var(--ck-border)',
    borderRadius: 3,
    color: 'var(--ck-text)',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    letterSpacing: '.1em',
    cursor: 'pointer',
  },
};

// Inject slider thumb styles globally
if (typeof document !== 'undefined') {
  const id = 'settings-slider-styles';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .settings-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px; height: 14px;
        border-radius: 50%;
        background: var(--ck-accent);
        border: 2px solid var(--ck-bg);
        cursor: pointer;
      }
      .settings-slider::-moz-range-thumb {
        width: 14px; height: 14px;
        border-radius: 50%;
        background: var(--ck-accent);
        border: 2px solid var(--ck-bg);
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}

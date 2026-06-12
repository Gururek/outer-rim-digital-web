import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { ClientMessage } from '@outer-rim/shared';
import NavigationTab from './tabs/NavigationTab';
import MarketTab from './tabs/MarketTab';
import CargoTab from './tabs/CargoTab';
import CrewTab from './tabs/CrewTab';

const BOTTOM_H = 270;
const LEFT_W   = 175;
const RIGHT_W  = 155;

const TABS = [
  { id: 'nav',    label: 'NAVIGATION' },
  { id: 'market', label: 'MARKET'     },
  { id: 'cargo',  label: 'CARGO'      },
  { id: 'crew',   label: 'CREW'       },
] as const;

interface Props {
  onSend: (msg: ClientMessage) => void;
}

export default function Terminal({ onSend }: Props) {
  const [activeTab, setActiveTab] = useState<string>('nav');
  const phase         = useGameStore(s => s.phase);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const mySessionId   = useGameStore(s => s.mySessionId);
  const turnNumber    = useGameStore(s => s.turnNumber);
  const isMyTurn      = activePlayerId === mySessionId;

  return (
    <div style={S.container}>
      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{
              ...S.tabBtn,
              ...(activeTab === tab.id ? S.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        {/* Right side of tab bar */}
        <div style={S.tabFill} />
        <div style={S.turnInfo}>
          <span style={S.turnLabel}>TURN {turnNumber}</span>
          {isMyTurn
            ? <span style={S.activeLabel} className="ck-anim-blink">▪ YOUR TURN</span>
            : <span style={S.waitLabel}>WAITING</span>
          }
        </div>
      </div>

      {/* Tab content */}
      <div style={S.content} className="ck-anim-fade" key={activeTab}>
        {activeTab === 'nav'    && <NavigationTab onSend={onSend} />}
        {activeTab === 'market' && <MarketTab onSend={onSend} />}
        {activeTab === 'cargo'  && <CargoTab onSend={onSend} />}
        {activeTab === 'crew'   && <CrewTab />}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 0,
    left: LEFT_W,
    right: RIGHT_W,
    height: BOTTOM_H,
    background: 'var(--ck-bg)',
    borderTop:   '1px solid var(--ck-border)',
    borderLeft:  '1px solid var(--ck-border)',
    borderRight: '1px solid var(--ck-border)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 20,
    fontFamily: "'Share Tech Mono', monospace",
  },
  tabBar: {
    display: 'flex',
    background: 'var(--ck-bg)',
    borderBottom: '1px solid var(--ck-border)',
    flexShrink: 0,
  },
  tabBtn: {
    border: 'none',
    borderRight: '1px solid var(--ck-border)',
    background: 'transparent',
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 9,
    letterSpacing: '.1em',
    color: 'var(--ck-dim)',
    padding: '8px 14px',
    cursor: 'pointer',
    transition: 'color .15s',
  },
  tabBtnActive: {
    background: 'var(--ck-panel)',
    color: 'var(--ck-accent)',
    borderBottom: '1px solid var(--ck-panel)',
    marginBottom: -1,
  },
  tabFill: {
    flex: 1,
    borderBottom: '1px solid var(--ck-border)',
  },
  turnInfo: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderLeft: '1px solid var(--ck-border)',
    flexShrink: 0,
  },
  turnLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.1em',
  },
  activeLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-green)',
    letterSpacing: '.08em',
  },
  waitLabel: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 8,
    color: 'var(--ck-dim)',
    letterSpacing: '.08em',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 14px',
  },
};

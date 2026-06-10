import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import type { ClientMessage, MarketDeckType } from '@outer-rim/shared';
import NavigationTab from './tabs/NavigationTab';
import MarketTab from './tabs/MarketTab';
import CargoTab from './tabs/CargoTab';
import CrewTab from './tabs/CrewTab';

interface Props {
  onSend: (msg: ClientMessage) => void;
}

const TABS = [
  { id: 'nav', label: 'NAV' },
  { id: 'market', label: 'MKT' },
  { id: 'cargo', label: 'CGO' },
  { id: 'crew', label: 'CRW' },
] as const;

export default function Terminal({ onSend }: Props) {
  const [activeTab, setActiveTab] = useState<string>('nav');
  const phase = useGameStore(s => s.phase);
  const activePlayerId = useGameStore(s => s.activePlayerId);
  const mySessionId = useGameStore(s => s.mySessionId);

  const isMyTurn = activePlayerId === mySessionId;

  return (
    <div style={styles.container}>
      {/* Tab bar */}
      <div style={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <div style={styles.statusBar}>
          {!isMyTurn && <span style={{ color: '#888' }}>Waiting...</span>}
          {isMyTurn && <span style={{ color: '#00ff88' }}>ACTIVE</span>}
        </div>
      </div>

      {/* Tab content */}
      <div style={styles.content}>
        {activeTab === 'nav' && <NavigationTab onSend={onSend} />}
        {activeTab === 'market' && <MarketTab onSend={onSend} />}
        {activeTab === 'cargo' && <CargoTab />}
        {activeTab === 'crew' && <CrewTab />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    width: '380px',
    maxHeight: '450px',
    background: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Courier New', monospace",
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
  },
  tab: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    fontFamily: "'Courier New', monospace",
    transition: 'color 0.2s',
  },
  tabActive: {
    color: '#00ffcc',
    borderBottom: '2px solid #00ffcc',
  },
  statusBar: {
    marginLeft: 'auto',
    padding: '0.5rem 0.75rem',
    fontSize: '0.65rem',
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    padding: '1rem',
    overflowY: 'auto',
    maxHeight: '380px',
  },
};

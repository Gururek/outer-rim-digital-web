import { useGameStore } from './stores/gameStore';
import { useGameRoom } from './hooks/useGameRoom';
import GalaxyMap from './scenes/GalaxyMap';
import CockpitOverlay from './ui/Cockpit/Cockpit';
import Terminal from './ui/Terminal/Terminal';
import LobbyScreen from './ui/LobbyScreen';
import CinematicOverlay from './ui/CinematicOverlay';
import GameOverScreen from './ui/GameOverScreen';
import HyperspaceEffect from './scenes/fx/HyperspaceEffect';
import DiceRoll3D from './scenes/fx/DiceRoll3D';
import ContactRevealOverlay from './ui/ContactRevealOverlay';
import { useAudio } from './hooks/useAudio';

export default function App() {
  const phase            = useGameStore(s => s.phase);
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const playerCount      = useGameStore(s => s.playerCount);
  const dismissCinematic = useGameStore(s => s.dismissCinematic);
  const setConnectionStatus = useGameStore(s => s.setConnectionStatus);
  const { connect, send, roomId } = useGameRoom();
  useAudio();

  const handleCreate = (opts?: Record<string, unknown>) => connect(undefined, opts).then(() => undefined);
  const handleJoin   = (code: string, opts?: Record<string, unknown>) => connect(code, opts).then(() => undefined);
  const handleMove   = (nodeId: number) => send({ type: 'CONFIRM_MOVE', payload: { destinationNodeId: nodeId } } as any);

  if (connectionStatus === 'error') {
    return (
      <div style={S.center}>
        <div style={S.centreTitle}>CONNECTION ERROR</div>
        <p style={S.centreSub}>Could not reach the game server.</p>
        <button style={S.centreBtn} onClick={() => setConnectionStatus('disconnected')}>
          RETURN TO LOBBY
        </button>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div style={S.center}>
        <div style={{ ...S.centreTitle, color: 'var(--ck-accent)' }} className="ck-anim-blink">
          ESTABLISHING LINK…
        </div>
        <p style={S.centreSub}>Connecting to the Outer Rim.</p>
      </div>
    );
  }

  if (connectionStatus !== 'connected') {
    return <LobbyScreen onConnect={handleCreate} onJoin={handleJoin} />;
  }

  if (phase === 'WAITING_FOR_PLAYERS') {
    return (
      <div style={S.center}>
        <div style={S.centreTitle}>WAITING FOR PLAYERS</div>
        {roomId && (
          <div style={S.codeCard}>
            <div className="ck-label">ROOM CODE</div>
            <div style={S.code}>{roomId}</div>
          </div>
        )}
        <p style={S.centreSub}>
          {playerCount >= 2
            ? `${playerCount} PLAYERS READY — STARTING SOON`
            : `NEED ${2 - playerCount} MORE PLAYER${2 - playerCount !== 1 ? 'S' : ''} TO START`}
        </p>
        <p style={{ ...S.centreSub, marginTop: 4, opacity: .5 }}>Share this code with friends.</p>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    return (
      <GameOverScreen onReturnToLobby={() => {
        setConnectionStatus('disconnected');
        useGameStore.setState({ phase: 'WAITING_FOR_PLAYERS', playerCount: 0, players: new Map() });
      }} />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'var(--ck-bg)' }}>
      <GalaxyMap onMoveConfirm={handleMove} />
      <CockpitOverlay />
      <Terminal onSend={send} />
      <CinematicOverlay onDismiss={dismissCinematic} />
      <HyperspaceEffect />
      <DiceRoll3D />
      <ContactRevealOverlay />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '0.75rem',
    fontFamily: "'Share Tech Mono', monospace",
    background: 'var(--ck-bg)',
  },
  centreTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.5rem',
    color: 'var(--ck-val)',
    letterSpacing: '.2em',
  },
  centreSub: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '.65rem',
    color: 'var(--ck-dim)',
    letterSpacing: '.12em',
    textTransform: 'uppercase',
  },
  centreBtn: {
    marginTop: '0.5rem',
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    color: 'var(--ck-text)',
    fontFamily: "'Orbitron',sans-serif",
    fontSize: 9,
    letterSpacing: '.12em',
    cursor: 'pointer',
  },
  codeCard: {
    background: 'var(--ck-panel)',
    border: '1px solid var(--ck-border)',
    borderRadius: 4,
    padding: '12px 24px',
    textAlign: 'center',
  },
  code: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.6rem',
    color: 'var(--ck-gold)',
    letterSpacing: '.2em',
    marginTop: 4,
  },
};


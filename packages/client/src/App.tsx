import { useGameStore } from './stores/gameStore';
import { useGameRoom } from './hooks/useGameRoom';
import GalaxyMap from './scenes/GalaxyMap';
import CockpitOverlay from './ui/Cockpit/Cockpit';
import Terminal from './ui/Terminal/Terminal';
import LobbyScreen from './ui/LobbyScreen';
import CinematicOverlay from './ui/CinematicOverlay';
import GameOverScreen from './ui/GameOverScreen';

export default function App() {
  const phase = useGameStore(s => s.phase);
  const connectionStatus = useGameStore(s => s.connectionStatus);
  const playerCount = useGameStore(s => s.playerCount);
  const dismissCinematic = useGameStore(s => s.dismissCinematic);
  const setConnectionStatus = useGameStore(s => s.setConnectionStatus);
  const { connect, send, roomId } = useGameRoom();

  const handleCreate = (options?: Record<string, unknown>) =>
    connect(undefined, options).then(() => undefined);
  
  const handleJoin = (code: string, options?: Record<string, unknown>) =>
    connect(code, options).then(() => undefined);

  const handleMoveConfirm = (nodeId: number) => {
    send({ type: 'CONFIRM_MOVE', payload: { destinationNodeId: nodeId } } as any);
  };

  if (connectionStatus === 'error') {
    return (
      <div style={styles.center}>
        <h1>Connection Error</h1>
        <p>Could not connect to game server.</p>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div style={styles.center}>
        <h1>Connecting...</h1>
        <p>Establishing link to the Outer Rim.</p>
      </div>
    );
  }

  if (connectionStatus !== 'connected') {
    return <LobbyScreen onConnect={handleCreate} onJoin={handleJoin} />;
  }

  if (phase === 'WAITING_FOR_PLAYERS') {
    return (
      <div style={styles.center}>
        <h1 style={styles.waitingTitle}>WAITING FOR PLAYERS</h1>
        {roomId && (
          <div style={styles.codeBox}>
            <p style={styles.codeLabel}>ROOM CODE</p>
            <p style={styles.code}>{roomId}</p>
          </div>
        )}
        <p style={styles.waitingSub}>Share this code with friends to join.</p>
        <p style={styles.waitingSub}>
          {playerCount >= 2
            ? `${playerCount} players ready — starting soon!`
            : `Need ${2 - playerCount} more player(s) to start.`}
        </p>
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
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <GalaxyMap onMoveConfirm={handleMoveConfirm} />
      <CockpitOverlay />
      <Terminal onSend={send} />
      <CinematicOverlay onDismiss={dismissCinematic} />
    </div>
  );
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '1rem',
    color: '#e0e0e0',
    fontFamily: 'monospace',
  },
  waitingTitle: {
    fontSize: '2rem',
    color: '#ffd700',
    letterSpacing: '0.2em',
  },
  waitingSub: {
    fontSize: '0.9rem',
    color: '#888',
  },
  codeBox: {
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.3)',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  },
  codeLabel: {
    fontSize: '0.65rem',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    marginBottom: '0.25rem',
  },
  code: {
    fontSize: '1.4rem',
    color: '#ffd700',
    fontWeight: 'bold',
    letterSpacing: '0.15em',
    fontFamily: 'monospace',
  },
};

export function getPhaseForApp(): any { return useGameStore; }

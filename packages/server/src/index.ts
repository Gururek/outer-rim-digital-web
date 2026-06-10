import colyseusPkg from 'colyseus';
const { Server } = colyseusPkg as any;
import { createServer } from 'http';
import express from 'express';
import { GameRoom } from './rooms/GameRoom.js';

const app = express();
const port = Number(process.env.PORT) || 2567;

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Root info — this is a WebSocket game server, not a web page
app.get('/', (_req, res) => {
  res.json({
    game: 'Star Wars: Outer Rim Digital',
    server: 'Colyseus v0.15',
    websocket: `ws://localhost:${port}`,
    health: `http://localhost:${port}/health`,
    client: 'Run `cd packages/client && npx vite` for the web UI',
    rooms: ['game_room'],
  });
});

const httpServer = createServer(app);
const gameServer = new Server({
  server: httpServer,
});

// Register the game room
gameServer.define('game_room', GameRoom);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  gameServer.gracefullyShutdown().then(() => {
    httpServer.close();
    process.exit(0);
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Outer Rim Server running on http://localhost:${port}`);
  console.log(`   Colyseus WebSocket: ws://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/health`);
});

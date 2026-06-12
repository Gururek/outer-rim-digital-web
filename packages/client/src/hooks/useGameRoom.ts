import { useEffect, useRef, useCallback } from 'react';
import { Client, Room } from 'colyseus.js';
import { useGameStore } from '../stores/gameStore';
import type { ClientMessage, ServerEvent } from '@outer-rim/shared';

// Derive hostname from the page origin so remote players connect to the right server.
// Override with VITE_SERVER_URL env var for staging/production deployments.
const SERVER_URL = import.meta.env.VITE_SERVER_URL
  ?? `ws://${window.location.hostname}:2567`;
const colyseusClient = new Client(SERVER_URL);

export function useGameRoom() {
  const roomRef = useRef<Room | null>(null);
  const { applyStateUpdate, handleServerEvent, setConnectionStatus, setMySessionId } = useGameStore();

  const connect = useCallback(async (roomCode?: string, options?: Record<string, unknown>) => {
    try {
      setConnectionStatus('connecting');
      const room: Room = roomCode
        ? await colyseusClient.joinById(roomCode, options)
        : await colyseusClient.create('game_room', options);
      console.log('[useGameRoom] room created:', room.roomId);

      roomRef.current = room;
      setMySessionId(room.sessionId);

      room.onStateChange((state: any) => applyStateUpdate(state));

      room.onMessage('SERVER_EVENT', (event: ServerEvent) => handleServerEvent(event));

      room.onLeave(() => setConnectionStatus('disconnected'));

      setConnectionStatus('connected');
      return room.roomId;
    } catch (err) {
      setConnectionStatus('error');
      throw err;
    }
  }, [applyStateUpdate, handleServerEvent, setConnectionStatus, setMySessionId]);

  const send = useCallback((msg: ClientMessage) => {
    roomRef.current?.send(msg.type, 'payload' in msg ? (msg as any).payload : undefined);
  }, []);

  useEffect(() => {
    return () => {
      roomRef.current?.leave();
    };
  }, []);

  return { connect, send, roomId: roomRef.current?.roomId };
}

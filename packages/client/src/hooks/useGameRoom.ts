import { useEffect, useRef, useCallback } from 'react';
import { Client, Room } from 'colyseus.js';
import { useGameStore } from '../stores/gameStore';
import type { ClientMessage, ServerEvent } from '@outer-rim/shared';

// Derive hostname from the page origin so remote players connect to the right server.
// Override with VITE_SERVER_URL env var for staging/production deployments.
const SERVER_URL = import.meta.env.VITE_SERVER_URL
  ?? `ws://${window.location.hostname}:2567`;
const colyseusClient = new Client(SERVER_URL);

const RECONNECT_WINDOW_MS = 28000; // slightly under server's 30s allowReconnection window

export function useGameRoom() {
  const roomRef           = useRef<Room | null>(null);
  const intentionalRef    = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { applyStateUpdate, handleServerEvent, setConnectionStatus, setMySessionId } = useGameStore();

  const attachHandlers = useCallback((room: Room) => {
    room.onStateChange((state: any) => applyStateUpdate(state));
    room.onMessage('SERVER_EVENT', (event: ServerEvent) => handleServerEvent(event));
    room.onLeave(() => {
      if (intentionalRef.current) {
        setConnectionStatus('disconnected');
        return;
      }
      // Unintended disconnect — try to reconnect within the server's allowReconnection window
      const { phase } = useGameStore.getState();
      const isActiveGame = phase !== 'WAITING_FOR_PLAYERS' && phase !== 'GAME_OVER';
      if (!isActiveGame) { setConnectionStatus('disconnected'); return; }

      // Update token if still connected
      if ((roomRef.current as any)?.reconnectionToken) {
        sessionStorage.setItem('or_reconnect_token', (roomRef.current as any).reconnectionToken);
      }
      const savedToken = sessionStorage.getItem('or_reconnect_token');
      if (!savedToken) { setConnectionStatus('disconnected'); return; }

      setConnectionStatus('reconnecting');

      const attempt = () =>
        colyseusClient.reconnect(savedToken)
          .then((newRoom: Room) => {
            roomRef.current = newRoom;
            attachHandlers(newRoom);
            setConnectionStatus('connected');
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          })
          .catch(() => { /* will time out below */ });

      attempt();
      // Keep retrying every 4s until the window closes
      const interval = setInterval(attempt, 4000);
      reconnectTimerRef.current = setTimeout(() => {
        clearInterval(interval);
        setConnectionStatus('error');
      }, RECONNECT_WINDOW_MS);
    });
  }, [applyStateUpdate, handleServerEvent, setConnectionStatus]);

  const connect = useCallback(async (roomCode?: string, options?: Record<string, unknown>) => {
    try {
      intentionalRef.current = false;
      setConnectionStatus('connecting');
      const room: Room = roomCode
        ? await colyseusClient.joinById(roomCode, options)
        : await colyseusClient.create('game_room', options);

      roomRef.current = room;
      setMySessionId(room.sessionId);
      // Save reconnection token once it's assigned (set after WebSocket handshake)
      const saveToken = () => {
        if ((room as any).reconnectionToken) {
          sessionStorage.setItem('or_reconnect_token', (room as any).reconnectionToken);
        }
      };
      setTimeout(saveToken, 500); // token is assigned shortly after connect

      attachHandlers(room);
      setConnectionStatus('connected');
      return room.roomId;
    } catch (err) {
      setConnectionStatus('error');
      throw err;
    }
  }, [attachHandlers, setConnectionStatus, setMySessionId]);

  const send = useCallback((msg: ClientMessage) => {
    roomRef.current?.send(msg.type, 'payload' in msg ? (msg as any).payload : undefined);
  }, []);

  useEffect(() => {
    return () => {
      intentionalRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      roomRef.current?.leave();
    };
  }, []);

  return { connect, send, roomId: roomRef.current?.roomId };
}

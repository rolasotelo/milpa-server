import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameStatus, MiClientSocket } from 'src/common/types/types';
import { InMemorySessionStore } from 'src/utils/sessionStore';

export const handleStartGameHandshake = (
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
  sessionID: string,
  newGameStatus: GameStatus,
) => {
  const session = sessionStore.findSession(sessionID);

  if (session) {
    socket.gameStatus = newGameStatus;
    sessionStore.saveSession(sessionID, {
      ...session,
      gameStatus: newGameStatus,
    });
  }

  socket
    .in(socket.roomCode)
    .emit(
      'start game handshake',
      sessionStore.findSession(sessionID)?.gameStatus,
    );
};

export const handleEndOfHandshake = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
  sessionID: string,
  newGameStatus: GameStatus,
) => {
  const session = sessionStore.findSession(sessionID);

  if (session) {
    socket.gameStatus = newGameStatus;
    sessionStore.saveSession(sessionID, {
      ...session,
      gameStatus: newGameStatus,
    });
  }

  io.to(socket.roomCode!).emit('ok start game');
};

export const handleStartUpdateMilpa = (
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
  sessionID: string,
  newGameStatus: GameStatus,
) => {
  const session = sessionStore.findSession(sessionID);

  if (session) {
    socket.gameStatus = newGameStatus;
    sessionStore.saveSession(sessionID, {
      ...session,
      gameStatus: newGameStatus,
    });
  }

  socket
    .in(socket.roomCode)
    .emit(
      'start update milpa',
      sessionStore.findSession(sessionID)?.gameStatus,
    );
};

export const handleEndUpdateMilpa = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
  sessionID: string,
  newGameStatus: GameStatus,
) => {
  const session = sessionStore.findSession(sessionID);

  if (session) {
    socket.gameStatus = newGameStatus;
    sessionStore.saveSession(sessionID, {
      ...session,
      gameStatus: newGameStatus,
    });
  }

  io.to(socket.roomCode!).emit('ok upate milpa');
};

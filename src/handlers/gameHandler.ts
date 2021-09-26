import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameStatus, MiClientSocket } from 'src/common/types/types';
import { InMemorySessionStore } from 'src/utils/sessionStore';

export const handlePlayerAction = (
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
    .to(socket.roomCode)
    .emit('game status updated, session', sessionStore.findSession(sessionID));
};

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

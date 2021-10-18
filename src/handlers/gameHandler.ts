import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Event } from 'src/common/enums';
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
      Event.Start_Game_Handshake,
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

  io.to(socket.roomCode!).emit(Event.Ok_Start_Game);
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
      Event.Start_Update_Board,
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

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

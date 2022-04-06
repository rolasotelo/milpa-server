/* eslint-disable */
import { GameStatus, MiClientSocket } from '../../common/interfaces';
import InMemorySessionStore from '../../utils/InMemorySessionStore';
import { MatchEvent } from '../../common/enums';

const handleStartHandshake = (
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
    .emit(MatchEvent.Start_Game_Handshake, newGameStatus);
};

export default handleStartHandshake;

/* eslint-disable no-param-reassign */
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { GameStatus, MiClientSocket } from '../../common/interfaces';
import InMemorySessionStore from '../../utils/InMemorySessionStore';

const handleFinishGameStatusUpdate = (
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

export default handleFinishGameStatusUpdate;

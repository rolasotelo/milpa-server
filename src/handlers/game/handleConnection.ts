/* eslint-disable no-param-reassign */
import { ExtendedError, MiClientSocket } from '../../common/interfaces';
import InMemorySessionStore from '../../utils/InMemorySessionStore';
import { log, randomID } from '../../common/constants';

const handleConnection = (
  socket: MiClientSocket,
  next: (err?: ExtendedError | undefined) => void,
  sessionStore: InMemorySessionStore,
  // eslint-disable-next-line consistent-return
) => {
  const { sessionID } = socket.handshake.auth;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.nickname = session.nickname;
      socket.roomCode = session.roomCode;
      socket.gameStatus = session.gameStatus;
      log('Session found, sessionID:', sessionID);
      return next();
    }
  }
  const { nickname } = socket.handshake.auth;
  if (!nickname) {
    return next(new Error('invalid nickname'));
  }
  const roomCode = socket.handshake.query.gameCode;
  if (!roomCode) {
    return next(new Error('invalid gamecode'));
  }
  log('no session found');
  socket.nickname = nickname;
  socket.roomCode = roomCode as string;
  socket.sessionID = randomID();
  socket.userID = randomID();
  socket.gameStatus = undefined;
  next();
};

export default handleConnection;

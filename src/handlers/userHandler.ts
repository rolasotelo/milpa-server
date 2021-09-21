import { log, MAX_PLAYERS, randomID } from '../common/constants';
import {
  ExtendedError,
  IO,
  MiRemoteSocket,
  MiSocket,
} from '../common/types/types';
import { InMemorySessionStore } from '../utils/sessionStore';

export const beforeConnectionOrReconnection = (
  socket: MiSocket,
  next: (err?: ExtendedError | undefined) => void,
  sessionStore: InMemorySessionStore,
) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    // find existing session
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.nickname = session.nickname;
      socket.roomCode = session.roomCode;
      socket.gameStatus = session.gameStatus;
      log('si session found, sessionID:', sessionID);
      log('roomcode', socket.roomCode);
      return next();
    }
  }
  const nickname = socket.handshake.auth.nickname;
  if (!nickname) {
    return next(new Error('invalid nickname'));
  }
  const roomCode = socket.handshake.query.gameCode;
  if (!roomCode) {
    return next(new Error('invalid gamecode'));
  }
  log('no session found, sessionID:', sessionID);
  log('roomcode', roomCode);
  socket.nickname = nickname;
  socket.roomCode = roomCode as string;
  socket.sessionID = randomID();
  socket.userID = randomID();
  next();
};

export const joinRoom = async (
  io: IO,
  socket: MiSocket,
  sessionStore: InMemorySessionStore,
) => {
  const users = [];
  const sockets: MiRemoteSocket[] = await io.in(socket.roomCode).fetchSockets();
  for (let skt of sockets) {
    users.push({
      userID: skt.userID,
      nickname: skt.nickname,
      gameStatus: skt.gameStatus,
    });
  }

  const playersInRoom = sockets.length;
  const actualGameStatus = socket.gameStatus
    ? socket.gameStatus
    : {
        yourTurn: playersInRoom === 0,
        score: 0,
        milpas: [
          ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
          ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ],
      };
  socket.gameStatus = actualGameStatus;

  if (playersInRoom < MAX_PLAYERS) {
    // persist session
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: actualGameStatus,
    });

    // emit session details
    socket.emit('session', {
      sessionID: socket.sessionID,
      userID: socket.userID,
      roomCode: socket.roomCode,
      gameStatus: actualGameStatus,
    });

    socket.join(socket.roomCode);

    users.push({
      userID: socket.userID,
      nickname: socket.nickname,
      gameStatus: actualGameStatus,
    });

    socket
      .to(socket.roomCode)
      .emit('room join', `${socket.userID} joined the room ${socket.roomCode}`);

    socket.in(socket.roomCode).emit('user connected', {
      userID: socket.userID,
      nickname: socket.nickname,
      gameStatus: actualGameStatus,
    });

    socket.emit('users', users);

    if (users.length === MAX_PLAYERS) {
      io.to(socket.roomCode!).emit('start game');
    }
  } else {
    socket.in(socket.roomCode).emit('connection attempted', {
      userID: socket.userID,
      nickname: socket.nickname,
    });
    socket.emit('room filled');
  }
};

export const handleUserDisconnection = (
  socket: MiSocket,
  sessionStore: InMemorySessionStore,
) => {
  socket.in(socket.roomCode).emit('player disconnected', {
    userID: socket.userID,
    nickname: socket.nickname,
  });
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    nickname: socket.nickname,
    roomCode: socket.roomCode,
    connected: false,
    gameStatus: socket.gameStatus,
  });
};

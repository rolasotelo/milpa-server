import { log, MAX_PLAYERS, randomID } from '../common/constants';
import {
  ExtendedError,
  IO,
  MiServerSocket,
  MiClientSocket,
} from '../common/types/types';
import { InMemorySessionStore } from '../utils/sessionStore';

export const beforeConnectionOrReconnection = (
  socket: MiClientSocket,
  next: (err?: ExtendedError | undefined) => void,
  sessionStore: InMemorySessionStore,
) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.nickname = session.nickname;
      socket.roomCode = session.roomCode;
      socket.gameStatus = session.gameStatus;
      log('si session found, sessionID:', sessionID);
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
  log('no session found');
  socket.nickname = nickname;
  socket.roomCode = roomCode as string;
  socket.sessionID = randomID();
  socket.userID = randomID();
  socket.gameStatus = undefined;
  next();
};

export const createOrJoinRoom = async (
  io: IO,
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
) => {
  const usersInRoom = [];
  const socketsAlreadyInRoom: MiServerSocket[] = await io
    .in(socket.roomCode)
    .fetchSockets();

  for (let socket of socketsAlreadyInRoom) {
    usersInRoom.push({
      userID: socket.userID,
      nickname: socket.nickname,
      gameStatus: socket.gameStatus,
      connected: true,
    });
  }

  if (socketsAlreadyInRoom.length < MAX_PLAYERS) {
    // persist session
    sessionStore.saveSession(socket.sessionID!, {
      userID: socket.userID!,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    // emit session details
    socket.emit('session saved', {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.join(socket.roomCode);

    socket.to(socket.roomCode).emit('player joined the room', {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.in(socket.roomCode).emit('user connected', {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    usersInRoom.push({
      userID: socket.userID,
      nickname: socket.nickname,
      gameStatus: socket.gameStatus,
      connected: true,
    });

    // + a todos
    io.to(socket.roomCode!).emit('users in room', usersInRoom);

    if (usersInRoom.length === MAX_PLAYERS) {
      socket
        .in(socket.roomCode)
        .emit('start game', socket.sessionID, usersInRoom);
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
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
) => {
  socket.in(socket.roomCode).emit('player disconnected', {
    userID: socket.userID,
    nickname: socket.nickname,
  });
  sessionStore.saveSession(socket.sessionID!, {
    userID: socket.userID!,
    nickname: socket.nickname,
    roomCode: socket.roomCode,
    connected: false,
    gameStatus: socket.gameStatus,
  });
};

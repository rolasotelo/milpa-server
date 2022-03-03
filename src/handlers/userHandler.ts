/* eslint-disable no-param-reassign */
import { log, MAX_PLAYERS, randomID } from '../common/constants';
import { MatchEvent } from '../common/enums';
import {
  ExtendedError,
  IO,
  MiClientSocket,
  MiServerSocket,
  Player,
} from '../common/types';
import InMemorySessionStore from '../utils/InMemorySessionStore';

export const beforeConnectionOrReconnection = (
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
      log('si session found, sessionID:', sessionID);
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

export const createOrJoinRoom = async (
  io: IO,
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
) => {
  const usersInRoom: Player[] = [];
  const socketsAlreadyInRoom: MiServerSocket[] = (await ((await io
    .in(socket.roomCode)
    .fetchSockets()) as unknown)) as MiServerSocket[];

  let socketAlreadyInRoom = false;

  // eslint-disable-next-line no-restricted-syntax
  for (const oldSocket of socketsAlreadyInRoom) {
    if (socket.userID === oldSocket.userID) {
      socketAlreadyInRoom = true;
    }
    usersInRoom.push({
      userID: oldSocket.userID,
      nickname: oldSocket.nickname,
      gameStatus: oldSocket.gameStatus,
      connected: true,
      sessionID: oldSocket.sessionID,
      roomCode: socket.roomCode,
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
    socket.emit(MatchEvent.Session_Saved, {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.to(socket.roomCode).emit(MatchEvent.Player_Joined_The_Room, {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.in(socket.roomCode).emit(MatchEvent.User_Connected, {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    if (!socketAlreadyInRoom) {
      socket.join(socket.roomCode);
      usersInRoom.push({
        userID: socket.userID!,
        nickname: socket.nickname,
        gameStatus: socket.gameStatus!,
        connected: true,
        roomCode: socket.roomCode,
        sessionID: socket.sessionID!,
      });
    }

    // + a todos
    io.to(socket.roomCode!).emit(MatchEvent.Users_In_Room, usersInRoom);

    if (usersInRoom.length === MAX_PLAYERS) {
      socket.in(socket.roomCode).emit(MatchEvent.Start_Game, usersInRoom);
    }
  } else {
    socket.in(socket.roomCode).emit(MatchEvent.Connection_Attempted, {
      userID: socket.userID,
      nickname: socket.nickname,
    });
    socket.emit(MatchEvent.Room_Filled);
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

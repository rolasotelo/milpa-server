import { log, MAX_PLAYERS, randomID } from '../common/constants';
import { Event } from '../common/enums';
import {
  ExtendedError,
  IO,
  MiClientSocket,
  MiServerSocket,
  Player,
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
  const usersInRoom: Player[] = [];
  const socketsAlreadyInRoom: MiServerSocket[] = (await (io
    .in(socket.roomCode)
    .fetchSockets() as unknown)) as MiServerSocket[];

  let socketAlreadyInRoom = false;

  for (let oldSocket of socketsAlreadyInRoom) {
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
    socket.emit(Event.Session_Saved, {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.to(socket.roomCode).emit(Event.Player_Joined_The_Room, {
      sessionID: socket.sessionID,
      userID: socket.userID,
      nickname: socket.nickname,
      roomCode: socket.roomCode,
      connected: true,
      gameStatus: socket.gameStatus,
    });

    socket.in(socket.roomCode).emit(Event.User_Connected, {
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
    io.to(socket.roomCode!).emit(Event.Users_In_Room, usersInRoom);

    if (usersInRoom.length === MAX_PLAYERS) {
      socket
        .in(socket.roomCode)
        .emit(Event.Start_Game, socket.sessionID, usersInRoom);
    }
  } else {
    socket.in(socket.roomCode).emit(Event.Connection_Attempted, {
      userID: socket.userID,
      nickname: socket.nickname,
    });
    socket.emit(Event.Room_Filled);
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

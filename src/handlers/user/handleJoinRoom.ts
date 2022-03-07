import { IO, MiClientSocket, MiServerSocket } from '../../common/interfaces';
import InMemorySessionStore from '../../utils/InMemorySessionStore';
import { MAX_PLAYERS } from '../../common/constants';
import { MatchEvent } from '../../common/enums';

const handleJoinRoom = async (
  io: IO,
  socket: MiClientSocket,
  sessionStore: InMemorySessionStore,
) => {
  const usersInRoom = [];
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

export default handleJoinRoom;

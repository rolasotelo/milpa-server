import { MiClientSocket } from '../../common/interfaces';
import InMemorySessionStore from '../../utils/InMemorySessionStore';

const handleDisconnection = (
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

export default handleDisconnection;

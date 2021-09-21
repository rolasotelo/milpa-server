import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { GameStatus, MiSocket } from './common/types/types';
import { handlePlayerAction } from './handlers/gameHandler';
import {
  beforeConnectionOrReconnection,
  handleUserDisconnection,
  joinRoom,
} from './handlers/userHandler';
import {
  logPlayerAction,
  logUserConnection,
  logUserDisconnection,
} from './utils/logs';
import { InMemorySessionStore } from './utils/sessionStore';

export function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8080', 'http://127.0.0.1:5500'],
      methods: ['GET', 'POST'],
    },
  });

  const sessionStore = new InMemorySessionStore();

  // * middlewares
  io.use((socket: MiSocket, next) => {
    beforeConnectionOrReconnection(socket, next, sessionStore);
  });

  // * once middlewares pass
  io.on('connect', async (socket: MiSocket) => {
    await joinRoom(io, socket, sessionStore);
    logUserConnection(io, socket);

    socket.on('disconnect', (reason) => {
      handleUserDisconnection(socket, sessionStore);
      logUserDisconnection(reason);
    });

    socket.on(
      'player action',
      (sessionID: string, newGameStatus: GameStatus) => {
        handlePlayerAction(socket, sessionStore, sessionID, newGameStatus);
        logPlayerAction(socket, newGameStatus);
      },
    );
  });

  return io;
}

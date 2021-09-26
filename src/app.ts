import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MiClientSocket } from './common/types/types';
import {
  beforeConnectionOrReconnection,
  createOrJoinRoom,
} from './handlers/userHandler';
import { logUserConnection } from './utils/logs';
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
  io.use((socket: MiClientSocket, next) => {
    beforeConnectionOrReconnection(socket, next, sessionStore);
  });

  // * once middlewares pass
  io.on('connect', async (socket: MiClientSocket) => {
    logUserConnection(io, socket);
    await createOrJoinRoom(io, socket, sessionStore);

    // socket.on('disconnect', (reason) => {
    //   handleUserDisconnection(socket, sessionStore);
    //   logUserDisconnection(reason);
    // });
    // socket.on(
    //   'player action',
    //   (sessionID: string, newGameStatus: GameStatus) => {
    //     handlePlayerAction(socket, sessionStore, sessionID, newGameStatus);
    //     logPlayerAction(socket, newGameStatus);
    //   },
    // );
  });

  return io;
}

import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { Event } from './common/enums';
import { GameStatus, MiClientSocket } from './common/types/types';
import {
  handleEndOfHandshake,
  handleEndUpdateMilpa,
  handleStartGameHandshake,
  handleStartUpdateMilpa,
} from './handlers/gameHandler';
import {
  beforeConnectionOrReconnection,
  createOrJoinRoom,
  handleUserDisconnection,
} from './handlers/userHandler';
import { logUserConnection, logUserDisconnection } from './utils/logs';
import { InMemorySessionStore } from './utils/sessionStore';

export function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:8080',
        'http://127.0.0.1:5500',
        'https://admin.socket.io',
      ],
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

    socket.on(
      Event.Start_Game_Handshake,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleStartGameHandshake(
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(
      Event.End_Of_Handshake,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleEndOfHandshake(
          io,
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(
      Event.Start_Update_Board,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleStartUpdateMilpa(socket, sessionStore, sessionID, newGameStatus);
      },
    );

    socket.on(
      Event.End_Update_Board,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleEndUpdateMilpa(
          io,
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(Event.Disconnection, (reason) => {
      handleUserDisconnection(socket, sessionStore);
      logUserDisconnection(reason);
    });
  });

  return io;
}

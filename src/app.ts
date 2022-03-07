import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MatchEvent } from './common/enums';
import { GameStatus, MiClientSocket } from './common/interfaces';
import { logUserConnection, logUserDisconnection } from './utils/logs';
import InMemorySessionStore from './utils/InMemorySessionStore';
import ALLOWED_ORIGINS from './common/allowedOrigins';
import {
  handleConnection,
  handleFinishGameStatusUpdate,
  handleFinishHandshake,
  handleStartGameStatusUpdate,
  handleStartHandshake,
} from './handlers/game';
import { handleDisconnection, handleJoinRoom } from './handlers/user';

export default function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
    },
  });

  const sessionStore = new InMemorySessionStore();

  // * middlewares
  io.use((socket: MiClientSocket, next) => {
    handleConnection(socket, next, sessionStore);
  });

  // * once middlewares pass
  io.on('connect', async (socket: MiClientSocket) => {
    logUserConnection(io, socket);
    await handleJoinRoom(io, socket, sessionStore);

    socket.on(
      MatchEvent.Start_Game_Handshake,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleStartHandshake(socket, sessionStore, sessionID, newGameStatus);
      },
    );

    socket.on(
      MatchEvent.End_Of_Handshake,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleFinishHandshake(
          io,
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(
      MatchEvent.Start_Update_Board,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleStartGameStatusUpdate(
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(
      MatchEvent.End_Update_Board,
      (sessionID: string, newGameStatus: GameStatus) => {
        handleFinishGameStatusUpdate(
          io,
          socket,
          sessionStore,
          sessionID,
          newGameStatus,
        );
      },
    );

    socket.on(MatchEvent.Disconnection, (reason) => {
      handleDisconnection(socket, sessionStore);
      logUserDisconnection(reason);
    });
  });

  return io;
}

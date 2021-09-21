import chalk from 'chalk';
import crypto from 'crypto';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MAX_PLAYERS } from './common/constants';
import {
  GameStatus,
  MiRemoteSocket,
  MiSocket,
  Session,
} from './common/types/types';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  // TODO create env for origin
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8080', 'http://127.0.0.1:5500'],
      methods: ['GET', 'POST'],
    },
  });

  const randomId = () => crypto.randomBytes(8).toString('hex');
  const { InMemorySessionStore } = require('./utils/sessionStore');
  const sessionStore = new InMemorySessionStore();

  // * middlewares
  io.use((socket: MiSocket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      // find existing session
      const session: Session = sessionStore.findSession(sessionID);
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
    socket.roomCode = roomCode;
    socket.sessionID = randomId();
    socket.userID = randomId();
    next();
  });

  // * once middlewares pass
  io.on('connect', async (socket: MiSocket) => {
    // + fetch existing users in room
    const users = [];
    const sockets: MiRemoteSocket[] = await io
      .in(socket.roomCode)
      .fetchSockets();
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
        .emit(
          'room join',
          `${socket.userID} joined the room ${socket.roomCode}`,
        );

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

    log(
      chalk.whiteBright.bgBlack.bold(
        socket.nickname,
        'connected - userID:',
        socket.userID,
      ),
      chalk.greenBright.bgBlack.bold('room: ', socket.roomCode),
    );

    log(
      chalk.blueBright.bgBlack.bold('total clients: ', io.engine.clientsCount),
    );
    socket.on('disconnect', (reason) => {
      log(chalk.redBright.bgBlack.bold('User disconected: ', reason));

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
    });

    socket.on(
      'player action',
      (sessionID: string, newGameStatus: GameStatus) => {
        const session: Session = sessionStore.findSession(sessionID);

        if (session) {
          socket.gameStatus = newGameStatus;
          sessionStore.saveSession(sessionID, {
            ...session,
            gameStatus: newGameStatus,
          });
        }

        socket
          .to(socket.roomCode)
          .emit(
            'game status updated, session',
            sessionStore.findSession(sessionID),
          );
        log(
          chalk.blue.bgBlack(`Player turn (${socket.userID}):`) +
            chalk.gray.bgBlack(newGameStatus.milpas),
        );
      },
    );
  });

  return io;
}

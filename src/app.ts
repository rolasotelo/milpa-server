import chalk from 'chalk';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MAX_PLAYERS } from './common/constants';
import { MiRemoteSocket, MiSocket } from './common/types/types';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  // TODO create env for origin
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8080', 'http://127.0.0.1:5500'],
      methods: ['GET', 'POST'],
    },
  });

  // * middlewares
  io.use((socket: MiSocket, next) => {
    const nickname = socket.handshake.auth.nickname;
    if (nickname === undefined) {
      return next(new Error('invalid nickname'));
    }
    socket.nickname = nickname;
    next();
  });

  // * once middlewares pass
  io.on('connect', async (socket: MiSocket) => {
    const roomCode = socket.handshake.query.gameCode;
    const nickname = socket.handshake.auth.nickname;

    if (roomCode) {
      // + fetch existing users in room
      const users = [];
      const sockets: MiRemoteSocket[] = await io.in(roomCode).fetchSockets();
      for (let skt of sockets) {
        users.push({
          userID: skt.id,
          nickname: skt.nickname,
        });
      }

      if (sockets.length < MAX_PLAYERS) {
        socket.join(roomCode);

        users.push({
          userID: socket.id,
          nickname: socket.nickname,
        });

        socket
          .to(roomCode)
          .emit('room join', `${socket.id} joined the room ${roomCode}`);

        socket.in(roomCode).emit('user connected', {
          userID: socket.id,
          nickname: socket.nickname,
        });

        socket.emit('users', users);

        if (users.length === MAX_PLAYERS) {
          io.to(roomCode).emit('start game');
        }
      } else {
        socket.in(roomCode).emit('connection attempted', {
          userID: socket.id,
          nickname: socket.nickname,
        });
        socket.emit('room filled');
      }
    } else {
      // ? what should I do if there is no gameCode in the handshake
    }

    log(
      chalk.whiteBright.bgBlack.bold(nickname, 'connected -', socket.id),
      chalk.greenBright.bgBlack.bold('room: ', roomCode),
    );
    log(chalk.blueBright.bgBlack.bold('total: ', io.engine.clientsCount));
    socket.on('disconnect', (reason) => {
      log(chalk.redBright.bgBlack.bold('User disconected: ', reason));
    });
    socket.on('chat message', (msg) => {
      log(chalk.blue.bgBlack('Message:') + chalk.gray.bgBlack(msg));
      io.emit('chat message', msg);
    });
  });

  return io;
}

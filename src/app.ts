import chalk from 'chalk';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MiRemoteSocket, MiSocket } from './common/types/types';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  // TODO create env for origin
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8080',
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
      socket.join(roomCode);
      socket
        .to(roomCode)
        .emit('room join', `${socket.id} joined the room ${roomCode}`);

      // + fetch existing users in room
      const users = [];
      const sockets: MiRemoteSocket[] = await io.in(roomCode).fetchSockets();
      for (let skt of sockets) {
        users.push({
          userID: skt.id,
          nickname: skt.nickname,
        });
      }
      socket.emit('users', users);

      // + notify existing users
      socket.in(roomCode).emit('user connected', {
        userID: socket.id,
        nickname: socket.nickname,
      });
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

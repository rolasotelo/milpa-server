import chalk from 'chalk';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { MiRemoteSocket, MiSocket } from './common/types/types';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: MiSocket, next) => {
    const nickname = socket.handshake.auth.nickname;
    if (nickname === undefined) {
      return next(new Error('invalid nickname'));
    }
    socket.nickname = nickname;
    next();
  });

  io.on('connect', async (socket: MiSocket) => {
    const gameCode = socket.handshake.query.gameCode;
    const nickname = socket.handshake.auth.nickname;

    if (gameCode) {
      socket.join(gameCode);
      socket
        .to(gameCode)
        .emit('room join', `${socket.id} joined the room ${gameCode}`);

      // fetch existing users
      const users = [];
      const sockets: MiRemoteSocket[] = await io.in(gameCode).fetchSockets();
      for (let skt of sockets) {
        users.push({
          userID: skt.id,
          nickname: skt.nickname,
        });
      }
      socket.emit('users', users);

      // notify existing users
      socket.in(gameCode).emit('user connected', {
        userID: socket.id,
        username: socket.nickname,
      });
    }

    log(
      chalk.whiteBright.bgBlack.bold(nickname, 'connected -', socket.id),
      chalk.greenBright.bgBlack.bold('room: ', gameCode),
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

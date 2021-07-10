import chalk from 'chalk';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:8080',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connect', (socket: Socket) => {
    const gameCode = socket.handshake.query.gameCode;
    const nickname = socket.handshake.auth.nickname;

    if (gameCode) {
      socket.join(gameCode);
      socket
        .to(gameCode)
        .emit('room join', `${socket.id} joined the room ${gameCode}`);
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

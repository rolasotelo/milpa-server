import chalk from 'chalk';
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

const log = console.log;

export function createApplication(httpServer: HttpServer): Server {
  const io = new Server(httpServer);

  io.on('connect', (socket: Socket) => {
    log(chalk.whiteBright.bgBlack.bold('a user connected'));
    socket.on('disconnect', (reason) => {
      log(chalk.redBright.bgBlack.bold('user disconected: ', reason));
    });
    socket.on('chat message', (msg) => {
      log(chalk.blue.bgBlack('message:') + chalk.gray.bgBlack(msg));
      io.emit('chat message', msg);
    });
  });

  return io;
}

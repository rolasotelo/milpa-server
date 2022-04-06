import chalk from 'chalk';
import { log } from '../common/constants';
import { IO, MiClientSocket } from '../common/interfaces';

export const logUserConnection = (io: IO, socket: MiClientSocket) => {
  log(
    chalk.whiteBright.bgBlack.bold(
      socket.nickname,
      'connected - userID:',
      socket.userID,
    ),
    chalk.greenBright.bgBlack.bold('room: ', socket.roomCode),
  );

  log(chalk.blueBright.bgBlack.bold('total clients: ', io.engine.clientsCount));
};

export const logUserDisconnection = (reason: string) => {
  log(chalk.redBright.bgBlack.bold('User disconected: ', reason));
};

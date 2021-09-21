import chalk from 'chalk';
import { log } from '../common/constants';
import { GameStatus, IO, MiSocket } from '../common/types/types';

export const logUserConnection = (io: IO, socket: MiSocket) => {
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

export const logPlayerAction = (
  socket: MiSocket,
  newGameStatus: GameStatus,
) => {
  log(
    chalk.blue.bgBlack(`Player turn (${socket.userID}):`) +
      chalk.gray.bgBlack(newGameStatus.milpas),
  );
};

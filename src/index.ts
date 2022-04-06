import chalk from 'chalk';
import express from 'express';
import { createServer } from 'http';
import { instrument } from '@socket.io/admin-ui';
import createApplication from './app';
import { log } from './common/constants';

const port = 3000;
const hostname = '0.0.0.0';

const app = express();
const httpServer = createServer(app);

app.get('/', (_, res) => {
  res.send({ message: 'Hola Mundo 🌽' });
});

const io = createApplication(httpServer);

instrument(io, {
  auth: false,
});

httpServer.listen(port, hostname, () => {
  log(
    chalk.yellowBright.bgBlack.bold(
      `Server running at http://${chalk.green(hostname)}:${chalk.red(port)}/`,
    ),
  );
});

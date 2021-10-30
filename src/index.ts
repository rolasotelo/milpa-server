import chalk from 'chalk';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { createApplication } from './app';
import { log } from './common/constants';
import { instrument } from '@socket.io/admin-ui';

const port = 3000;
const hostname = '127.0.0.1';

const app = express();
const httpServer = createServer(app);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
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

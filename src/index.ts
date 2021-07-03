import express from 'express';
import chalk from 'chalk';
import { createServer } from 'http';
import { createApplication } from './app';
import path from 'path';

const port = 3000;
const log = console.log;
const hostname = '127.0.0.1';

const app = express();
const httpServer = createServer(app);

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

createApplication(httpServer);

httpServer.listen(port, hostname, () => {
  log(
    chalk.yellowBright.bgBlack.bold(
      `Server running at http://${chalk.green(hostname)}:${chalk.red(port)}/`,
    ),
  );
});

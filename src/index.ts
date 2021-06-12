import express from 'express';
import chalk from 'chalk';

const app = express();
const port = 3000;
const log = console.log;

app.get('/', (_, res) => {
  res.send('Hello World 🦧!');
});

app.listen(port, () => {
  log(
    chalk.yellowBright.bgBlack.bold(
      `Server running at http://${chalk.green('localhost')}:${chalk.red(
        port,
      )}/`,
    ),
  );
});

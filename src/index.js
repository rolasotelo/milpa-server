const express = require('express');
const chalk = require('chalk');
const app = express();
const port = 3000;
const log = console.log;

const a = 0;

app.get('/', (req, res) => {
  res.send('Hello World 🦙!');
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

import express from 'express';
import chalk from 'chalk';
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello from auth-service' });
});

const server = app.listen(port, () => {
  console.log(
    `auth-srevice    [ Ready ]`,
    chalk.bold.greenBright(`    http://localhost:${port}`)
  );
});

server.on('error', (err) => console.log(err));

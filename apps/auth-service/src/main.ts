import express from 'express';
import chalk from 'chalk';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello from auth-service' });
});

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(
    `auth-srevice    [ Ready ]`,
    chalk.bold.greenBright(`    http://localhost:${port}`)
  );
});

server.on('error', (err) => console.log(err));

/* eslint-disable @nx/enforce-module-boundaries */
import express from 'express';
import chalk from 'chalk';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import router from './routes/auth.router';

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello from auth-service' });
});

app.use(errorMiddleware);
app.use('/api', router);

const server = app.listen(port, () => {
  console.log(
    `auth-service  [ Ready ]`,
    chalk.bold.greenBright(`    http://localhost:${port}/api`)
  );
});

server.on('error', (err) => console.log(err));

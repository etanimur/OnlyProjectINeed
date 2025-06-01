/* eslint-disable @nx/enforce-module-boundaries */
import express from 'express';
import chalk from 'chalk';
// import { errorMiddleware } from '@packages/error-handler/err/or-middleware';
const { errorMiddleware } = require('@packages/error-handler/error-middleware');
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
// import fs from 'fs';
// import path from 'path';
const swaggerDoc = require('./swagger-output.json');
// console.log(swaggerDoc);
const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.send({ message: 'Hello from auth-service' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDoc);
});

app.use(errorMiddleware);
app.use('/api', router);

const server = app.listen(port, () => {
  console.log(
    `auth-service  [ Ready ]`,
    chalk.bold.greenBright(`    http://localhost:${port}/api`)
  );
  console.log(
    `auth-service  [ Ready ]  ${chalk.bold.red('[ DOCS ]')}`,
    chalk.bold.greenBright(`    http://localhost:${port}/docs`)
  );
  // console.log(
  //   `auth-service  [ Ready ]  ${chalk.bold.red('[ JSON ]')}`,
  //   chalk.bold.greenBright(`    http://localhost:${port}/docs-json`)
  // );
});

server.on('error', (err) => console.log(err));

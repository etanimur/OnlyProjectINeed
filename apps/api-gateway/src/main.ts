/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import chalk from 'chalk';
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import proxy from 'express-http-proxy';
// import swaggerUi from 'swagger-ui-express';
// import axios from 'axios';
import cookieParser from 'cookie-parser';

const app = express();

app.set('trust proxy', 1);
app.use('/', proxy('http://localhost:6001'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(
  cors({
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
    origin: ['http://localhost:3000'],
  })
);
app.use(morgan('dev'));
const limiter = rateLimit({
  keyGenerator: (req: any) => req.ip,
  max: (req: any) => (req.user ? 1000 : 100),
  legacyHeaders: true,
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests try again later',
});
app.use(limiter);
app.use(cookieParser());

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(
    `api-gateway   [  Ready  ]     ${chalk.bold.greenBright(
      `http://localhost:${port}/api`
    )}`
  );
});
server.on('error', console.error);

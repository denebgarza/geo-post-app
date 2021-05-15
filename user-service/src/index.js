import express from 'express';
import expressPino from 'express-pino-logger';

import config from './config.js';
import logger from './logger.js';

import codeRoute from './routes/code.js';

const app = express();

const expressLogger = expressPino({ logger });

app.get('/', (req, res) => {
  res.status(200).send(config.app.name);
});

app.use(express.json());
app.use(expressLogger);

app.use('/code', codeRoute);

app.listen(config.app.port, () => {
  logger.info(`${config.app.name} listening on port ${config.app.port}`);
});
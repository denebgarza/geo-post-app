import express from 'express';
import pino from 'pino';
import expressPino from 'express-pino-logger';

import config from './config.js';

const app = express();

const logger = pino({ level: 'info' });
const expressLogger = expressPino({ logger });

app.get('/', (req, res) => {
  res.status(200).send('user-service');
});

app.use(expressLogger);

app.listen(config.app.port, () => {
  logger.info(`${config.app.name} listening on port ${config.app.port}`);
});

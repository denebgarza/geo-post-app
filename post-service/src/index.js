import express from 'express';
import expressPino from 'express-pino-logger';
import * as mongodb from './dao/mongodb.js';
import config from './config.js';
import logger from './logger.js';

const app = express();

const expressLogger = expressPino({ logger });
const init = async () => {
  await mongodb.setup();

  app.get('/', (req, res) => {
    res.status(200).send(config.app.name);
  });

  app.use(express.json());
  app.use(expressLogger);

  app.listen(config.app.port, () => {
    logger.info(`${config.app.name} listening on port ${config.app.port}`);
  });
};

init();

import express from 'express';
import pino from 'pino';
import expressPino from 'express-pino-logger';

const app = express();
const port = 3000;

const logger = pino({ level: 'info' });
const expressLogger = expressPino({ logger });

app.get('/', (req, res) => {
  res.status(200).send('user-service');
});

app.use(expressLogger);

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});

import express from 'express';
import parentLogger from '../logger.js';
import { generate, verify, channels } from '../api/code.js';

const logger = parentLogger.child({ module: 'code-route' });
const router = express.Router();

router.post('/generate', (req, res) => {
  generate(channels.EMAIL, req.body.target);
  res.sendStatus(204);
});

router.post('/verify', async (req, res) => {
  try {
    const result = await verify(req.body.id, req.body.code);
    res.status(200).send(result);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

export default router;

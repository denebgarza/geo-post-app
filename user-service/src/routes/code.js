import express from 'express';
import parentLogger from '../logger.js';
import { generate, verify, channels } from '../api/code.js';

const logger = parentLogger.child({ module: 'code-route' });
const router = express.Router();

router.post('/generate', async (req, res) => {
  const retVal = await generate(channels.EMAIL, req.body.target);
  res.status(200).send(retVal);
});

router.post('/verify', async (req, res) => {
  try {
    const result = await verify(req.body.code_id, parseInt(req.body.code, 10));
    res.status(200).send(result);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

export default router;

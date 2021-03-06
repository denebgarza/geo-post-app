import { v4 as uuidv4 } from 'uuid';
import redisClient from './redis.js';
import parentLogger from '../logger.js';

const logger = parentLogger.child({ module: 'code-dao' });

const CODE_PREFIX = 'code';
const ATTEMPTS_FIELD = 'attempts';
const BODY_FIELD = 'body';

const insert = (code, channel, target) => {
  const codeId = uuidv4();
  const key = `${CODE_PREFIX}:${codeId}`;
  const value = {
    code,
    channel,
    target,
  };
  logger.debug(`Inserting code=${code} codeId=${codeId} for channel=${channel} target=${target}`);
  redisClient.hmset(key, [
    BODY_FIELD, JSON.stringify(value),
    ATTEMPTS_FIELD, 0,
  ]);
  return codeId;
};

const get = async (codeId) => {
  const key = `${CODE_PREFIX}:${codeId}`;
  if (!(await redisClient.exists(key))) {
    logger.error(`Tried to get codeId=${codeId} which does not exist`);
    throw Error('Tried to get code that does not exist');
  }

  await redisClient.hincrby(key, ATTEMPTS_FIELD, 1);

  const codeHashMap = await redisClient.hgetall(key);
  const retVal = JSON.parse(codeHashMap[BODY_FIELD]);
  retVal[ATTEMPTS_FIELD] = codeHashMap[ATTEMPTS_FIELD];

  return retVal;
};

const remove = async (codeId) => {
  const key = `${CODE_PREFIX}:${codeId}`;
  await redisClient.del(key);
};

export { insert, get, remove };

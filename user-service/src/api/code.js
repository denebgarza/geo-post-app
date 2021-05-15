import { insert, get, remove } from '../dao/code.js';
import parentLogger from '../logger.js';

const logger = parentLogger.child({ module: 'code-dao' });

const channels = Object.freeze({
  EMAIL: 'email',
});

const results = Object.freeze({
  SUCCESS: 'success',
  TOO_MANY_ATTEMPTS: 'too_many_attempts',
  WRONG_CODE: 'wrong_code',
});

const MAX_ATTEMPTS = 3;

const generate = (channel, target) => {
  const code = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
  switch (channel) {
    case channels.EMAIL:
      // TODO: Actually send email with verification code.
      logger.info(`Sending verification code for channel=${channel} target=${target}`);
      break;
    default:
      logger.error(`Unknown channel ${channel}`);
  }
  insert(code, channel, target);
};

const verify = async (codeId, code) => {
  const generatedCode = await get(codeId);

  if (code === generatedCode.code) {
    remove(codeId);
    return {
      result: results.SUCCESS,
    };
  }

  if (generatedCode.attempts > MAX_ATTEMPTS) {
    remove(codeId);
    return {
      result: results.TOO_MANY_ATTEMPTS,
    };
  }

  logger.debug(`Verifying input code=${code} against store code=${generatedCode.code}`);
  
  return {
    result: results.WRONG_CODE,
  };
};

export { generate, verify, channels };

import jwt from 'jsonwebtoken';
import * as codeDao from '../dao/code.js';
import * as userDao from '../dao/user.js';
import parentLogger from '../logger.js';
import config from '../config.js';

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
  const existingUser = userDao.getByContact(channel, target);
  const type = (existingUser === null) ? 'new' : 'return';
  const codeId = codeDao.insert(code, channel, target);
  return { type, codeId };
};

const verify = async (codeId, code) => {
  const generatedCode = await codeDao.get(codeId);

  if (code === generatedCode.code) {
    await codeDao.remove(codeId);
    // Check if user already exists with this contact information.
    let targetUser = await userDao.getByContact(generatedCode.channel, generatedCode.target);
    if (!targetUser) {
      targetUser = await userDao.insert(generatedCode.channel, generatedCode.target);
    }
    logger.info(`Verified code for userUuid=${targetUser.userUuid}`);
    return {
      jwt: jwt.sign({ ...targetUser }, config.app.jwt_secret),
      result: results.SUCCESS,
    };
  }

  if (generatedCode.attempts > MAX_ATTEMPTS) {
    logger.info(`Too many attempts for codeId=${codeId}`);
    await codeDao.remove(codeId);
    return {
      result: results.TOO_MANY_ATTEMPTS,
    };
  }

  return {
    result: results.WRONG_CODE,
  };
};

export { generate, verify, channels };

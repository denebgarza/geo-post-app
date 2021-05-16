import { v4 as uuidv4 } from 'uuid';
import parentLogger from '../logger.js';
import { getCollection } from './mongodb.js';

const USERS_COLLECTION = 'users';

const logger = parentLogger.child({ module: 'user-dao' });

const insert = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
  const uuid = uuidv4();
  logger.debug(`Inserting user userUuid=${uuid} channel=${channel} target=${target}`);
  const user = {
    uuid,
    create_date: new Date(Date.now()),
    last_login: new Date(Date.now()),
  };
  user[channel] = target;

  await collection.insertOne(user);
};

const getByUuid = async (userUuid) => {
  const collection = getCollection(USERS_COLLECTION);
  collection.findOne({
    uuid: userUuid,
  });
};

const getByContact = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
  return collection.findOne({
    [channel]: target,
  });
};

export { insert, getByUuid, getByContact };

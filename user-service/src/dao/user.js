import MUUID from 'uuid-mongodb';
import commons from 'commons';
import parentLogger from '../logger.js';
import { getCollection, collections } from './mongodb.js';

MUUID.mode('relaxed');

const logger = parentLogger.child({ module: 'user-dao' });

const { transformId } = commons.mongodb;

const insert = async (channel, target) => {
  const collection = getCollection(collections.USERS);
  const uuid = MUUID.v4();
  logger.info(`Inserting user userUuid=${uuid.toString()} channel=${channel} target=${target}`);
  const user = {
    _id: uuid,
    create_date: new Date(Date.now()),
    last_login: new Date(Date.now()),
  };
  user[channel] = target;

  const result = await collection.insertOne(user);
  if (result.result.ok !== 1) throw Error('Could not insert new user');
  const newUser = result.ops[0];
  transformId(newUser);
  return newUser;
};

const getById = async (userId) => {
  const collection = getCollection(collections.USERS);
  const user = await collection.findOne({ _id: MUUID.from(userId) });
  transformId(user);
  return user;
};

const getByContact = async (channel, target) => {
  const collection = getCollection(collections.USERS);
  const user = await collection.findOne({ [channel]: target });
  transformId(user);
  return user;
};

export { insert, getById, getByContact };

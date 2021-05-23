/* eslint-disable no-underscore-dangle */
import MUUID from 'uuid-mongodb';
import parentLogger from '../logger.js';
import uuidIdToString from './util.js';
import { getCollection } from './mongodb.js';

const USERS_COLLECTION = 'users';

const logger = parentLogger.child({ module: 'user-dao' });

const insert = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
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
  uuidIdToString(newUser);
  return newUser;
};

const getById = async (userId) => {
  const collection = getCollection(USERS_COLLECTION);
  const user = await collection.findOne({ _id: MUUID.from(userId) });
  uuidIdToString(user);
  return user;
};

const getByContact = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
  const user = await collection.findOne({ [channel]: target });
  uuidIdToString(user);
  return user;
};

export { insert, getById, getByContact };

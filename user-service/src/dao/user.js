/* eslint-disable no-underscore-dangle */
import { v4 as uuidv4 } from 'uuid';
import parentLogger from '../logger.js';
import { getCollection } from './mongodb.js';

const USERS_COLLECTION = 'users';

const logger = parentLogger.child({ module: 'user-dao' });

const insert = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
  const uuid = uuidv4();
  logger.info(`Inserting user userUuid=${uuid} channel=${channel} target=${target}`);
  const user = {
    _id: uuid,
    create_date: new Date(Date.now()),
    last_login: new Date(Date.now()),
  };
  user[channel] = target;

  const result = await collection.insertOne(user);
  if (result.result.ok !== 1) throw Error('Could not insert new user');
  const newUser = result.ops[0];
  newUser.id = newUser._id;
  delete newUser._id;
  return newUser;
};

const getById = async (userId) => {
  const collection = getCollection(USERS_COLLECTION);
  const user = await collection.findOneAndUpdate(
    { _id: userId },
    [
      { $set: { id: '$_id' } },
      { $unset: '_id' },
    ],
    {
      returnNewDocument: true,
    },
  );
  return user;
};

const getByContact = async (channel, target) => {
  const collection = getCollection(USERS_COLLECTION);
  const user = await collection.findOneAndUpdate(
    { [channel]: target },
    [
      { $set: { id: '$_id' } },
      { $unset: '_id' },
    ],
    {
      returnNewDocument: true,
    },
  );
  return user;
};

export { insert, getById, getByContact };

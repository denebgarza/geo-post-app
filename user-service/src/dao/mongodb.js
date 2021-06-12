import commons from 'commons';
import config from '../config.js';

let db;

const collections = {
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
};
const { initMongoDb } = commons.mongodb;
const getCollection = (collection) => db.collection(collection);

const setup = async () => {
  db = await initMongoDb(
    config.mongodb.username,
    config.mongodb.password,
    config.mongodb.host,
    config.mongodb.port,
    config.mongodb.database,
  );
};

export { setup, getCollection, collections };

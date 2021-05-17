import mongodb from 'mongodb';
import config from '../config.js';

let db;

const setup = async () => {
  const { MongoClient } = mongodb;
  const mongoClient = new MongoClient(
    `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}`,
  );
  await mongoClient.connect();
  db = mongoClient.db(config.mongodb.database);
};

const getCollection = (collection) => db.collection(collection);

export { setup, getCollection };

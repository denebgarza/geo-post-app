import mongodb from 'mongodb';
import config from '../config.js';
import parentLogger from '../logger.js';

const logger = parentLogger.child({ module: 'mongodb' });

let db;

const collections = {
  POSTS: 'posts',
};

const getCollection = (collection) => db.collection(collection);

const setup = async () => {
  const { MongoClient } = mongodb;
  const mongoClient = new MongoClient(
    `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}`,
  );
  await mongoClient.connect();
  db = mongoClient.db(config.mongodb.database);

  const result = await getCollection(collections.POSTS).createIndex({ geo_location: '2dsphere' });
  logger.info(`Index created ${result}`);
};

export { setup, getCollection, collections };

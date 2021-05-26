import mongodb from 'mongodb';
import config from '../config.js';

let db;

const collections = {
  POSTS: 'posts',
  POST_VIEWS: 'post-views',
};

const getCollection = (collection) => db.collection(collection);

const setup = async () => {
  const { MongoClient } = mongodb;
  const mongoClient = new MongoClient(
    `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}`,
  );
  await mongoClient.connect();
  db = mongoClient.db(config.mongodb.database);

  await getCollection(collections.POSTS).createIndex({ geo_location: '2dsphere' });
  await getCollection(collections.POSTS).createIndex({ update_date: -1 });
};

export { setup, getCollection, collections };

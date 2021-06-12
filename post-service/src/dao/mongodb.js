/* eslint-disable import/no-extraneous-dependencies */
import commons from 'commons';
import config from '../config.js';

let db;

const collections = {
  POSTS: 'posts',
  POST_VIEWS: 'post-views',
  COMMENTS: 'comments',
  ENGLISH_WORDS: 'english-words',
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
  await getCollection(collections.POSTS).createIndex({ geo_location: '2dsphere' });
  await getCollection(collections.POSTS).createIndex({ update_date: -1 });
  await getCollection(collections.COMMENTS).createIndex({ update_date: 1 });
  await getCollection(collections.COMMENTS).createIndex({ post_id: 1, display_name: 1 });
  await getCollection(collections.COMMENTS).createIndex({ post_id: 1, user_id: 1 });
};

export { setup, getCollection, collections };

import MUUID from 'uuid-mongodb';
import parentLogger from '../logger.js';
import uuidIdToString from './util.js';
import { getCollection, collections } from './mongodb.js';

MUUID.mode('relaxed');

const POSTS_COLLECTION = collections.POSTS;

const logger = parentLogger.child({ module: 'posts-dao' });

const insert = async (userId, body, lng, lat) => {
  const collection = getCollection(POSTS_COLLECTION);
  const uuid = MUUID.v4();
  logger.info(`Inserting post postUuid=${uuid} `);
  const post = {
    _id: uuid,
    user_id: userId,
    body,
    geo_location: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    create_date: new Date(Date.now()),
    update_date: new Date(Date.now()),
  };

  const result = await collection.insertOne(post);
  if (result.result.ok !== 1) throw Error('Could not insert new post');
  const newPost = result.ops[0];
  uuidIdToString(newPost);
  return newPost;
};

const findById = async (postId) => {
  logger.info(`Finding post by postId=${postId}`);
  const collection = getCollection(POSTS_COLLECTION);
  const post = await collection.findOne({ _id: MUUID.from(postId) });
  return post;
};

const findAllByLocation = async (lng, lat, radius) => {
  const EARTH_RADIUS_METERS = 6378100;
  const collection = getCollection(POSTS_COLLECTION);
  const posts = await collection.find(
    {
      geo_location: {
        $geoWithin: {
          $centerSphere: [[lng, lat], radius / EARTH_RADIUS_METERS],
        },
      },
    },
  );
  const postsArray = await posts.toArray();
  postsArray.forEach((post) => uuidIdToString(post));
  logger.info(`Found ${postsArray.length} posts near [${lng}, ${lat}] with radiusMeters=${radius}`);
  return postsArray;
};

export { insert, findById, findAllByLocation };

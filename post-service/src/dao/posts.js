import { v4 as uuidv4 } from 'uuid';
import parentLogger from '../logger.js';
import { getCollection, collections } from './mongodb.js';

const POSTS_COLLECTION = collections.POSTS;

const logger = parentLogger.child({ module: 'posts-dao' });

const insert = async (userId, body, lng, lat) => {
  const collection = getCollection(POSTS_COLLECTION);
  const uuid = uuidv4();
  logger.info(`Inserting post postUuid=${uuid} `);
  const post = {
    _id: uuid,
    userId,
    body,
    geo_location: {
      type: "Point",
      coordinates: [lng, lat],
    },
    create_date: new Date(Date.now()),
    update_date: new Date(Date.now()),
  };

  const result = await collection.insertOne(post);
  if (result.result.ok !== 1) throw Error('Could not insert new post');
  const newPost = result.ops[0];
  newPost.id = newPost._id;
  delete newPost._id;
  return newPost;
};

const findById = async (postId) => {
  logger.info(`Finding post by postId=${postId}`);
  const collection = getCollection(POSTS_COLLECTION);
  const post = await collection.findOneAndUpdate(
    { _id: postId },
    [
      { $set: { id: '$_id' } },
      { $unset: '_id' },
    ],
    {
      returnNewDocument: true,
    },
  );
  return post;
};

const findAllByLocation = async (lng, lat, radius) => {
  const EARTH_RADIUS_METERS = 6378100;
  const collection = getCollection(POSTS_COLLECTION);
  const posts = await collection.aggregate([
    {
      $match: {
        geo_location: {
          $geoWithin: {
            $centerSphere: [ [lng, lat] , radius / EARTH_RADIUS_METERS ]
          },
        },
      },
    },
    { $set: { id: '$_id' } },
    { $unset: '_id' },
  ]);
  logger.info(`Found ${posts.length} posts near [${lng}, ${lat}] with radiusMeters=${radius}`);
  return await posts.toArray();
};

export { insert, findById, findAllByLocation };

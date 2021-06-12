import MUUID from 'uuid-mongodb';
import commons from 'commons';
import parentLogger from '../logger.js';
import { getCollection, collections } from './mongodb.js';

const logger = parentLogger.child({ module: 'views-dao' });

const { transformId } = commons.mongodb;

const insert = async (postId, hll) => {
  logger.info(`Inserting post views for postId=${postId}`);
  const viewsCollection = getCollection(collections.POST_VIEWS);
  const postUuid = MUUID.from(postId);
  const obj = {
    _id: postUuid,
    hll,
  };
  await viewsCollection.updateOne(
    { _id: postUuid },
    { $set: obj },
    { upsert: true },
  );
};

const get = async (postId) => {
  logger.info(`Getting post views for postId=${postId}`);
  const viewsCollection = getCollection(collections.POST_VIEWS);
  const postViews = await viewsCollection.findOne({
    _id: MUUID.from(postId),
  });
  if (postViews === null) return null;
  transformId(postViews);
  return postViews.hll.buffer;
};

export { insert, get };

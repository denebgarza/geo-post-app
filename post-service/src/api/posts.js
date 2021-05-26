import * as postsDao from '../dao/posts.js';
import * as viewsDao from '../dao/views.js';
import parentLogger from '../logger.js';
import redisClient from '../dao/redis.js';

const logger = parentLogger.child({ module: 'views-dao' });

const MAX_RADIUS_METERS = 5000;
const POST_PREVIEW_LENGTH = 200;
const POST_VIEWS_KEY_PREFIX = 'post_views';
const PERSIST_VIEWS_WINDOW_SECONDS = 30;

let viewsLastPersistedOn = Date.now();

async function getViewCount(postId) {
  const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
  return redisClient.pfcount(key);
}

async function incrementViewCount(postId, userId) {
  logger.info(`Incrementing post views HLL for postId=${postId} userId=${userId}`);
  const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
  const isoDate = new Date().toISOString();
  const truncateIdx = isoDate.indexOf(':');
  // Unique hourly views
  const uniqueView = `${userId}:${isoDate.substr(0, truncateIdx)}`;
  await redisClient.pfadd(key, uniqueView);

  if (Math.floor((Date.now() - viewsLastPersistedOn) / 1000) > PERSIST_VIEWS_WINDOW_SECONDS) {
    viewsDao.insert(postId, await redisClient.get(key));
    viewsLastPersistedOn = Date.now();
  }
}

const insert = async (userId, body, lng, lat) => {
  const newPost = await postsDao.insert(userId, body, lng, lat);
  incrementViewCount(newPost.id, userId);
  return newPost;
};

const findById = async (postId) => postsDao.findById(postId);

const view = async (postId, userId) => {
  const post = await findById(postId);
  if (post) {
    const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
    const viewCount = await redisClient.pfcount(key);
    post.views = viewCount;
    const viewsCached = await redisClient.exists(key);
    incrementViewCount(postId, userId);

    if (!viewsCached) {
      logger.warn(`Post views not found in cache for postId=${postId}. Restoring from datastore.`);
      const postViewsHll = await viewsDao.get(postId);
      if (postViewsHll === null) {
        logger.warn(`Post views not found in datastore for postId=${postId}. Creating a new HLL.`);
        await incrementViewCount(postId, userId);
        const viewsHll = await redisClient.get(key);
        viewsDao.insert(postId, viewsHll);
      } else {
        redisClient.set(key, postViewsHll);
      }
    }
  }
  return post;
};

const findAllByLocation = async (lng, lat, radiusMeters) => {
  const radius = Math.min(parseInt(radiusMeters, 10), MAX_RADIUS_METERS);

  const posts = await postsDao.findAllByLocation(
    parseFloat(lng), parseFloat(lat), parseInt(radius, 10),
  );

  await Promise.all(posts.map(async (post, idx, arr) => {
    if (arr[idx].body.length > POST_PREVIEW_LENGTH) {
      arr[idx].body = post.body.substring(0, POST_PREVIEW_LENGTH);
    }
    arr[idx].views = await getViewCount(post.id);
  }));

  return posts;
};

export {
  insert, findById, view, findAllByLocation,
};

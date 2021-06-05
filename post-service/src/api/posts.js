import * as postsDao from '../dao/posts.js';
import * as viewsDao from '../dao/views.js';
import parentLogger from '../logger.js';
import redisClient from '../dao/redis.js';

const logger = parentLogger.child({ module: 'views-dao' });

const MAX_RADIUS_METERS = 5000;
const POST_PREVIEW_LENGTH = 200;
const POST_VIEWS_KEY_PREFIX = 'post_views';

const PERSIST_VIEWS_WINDOW_SECONDS = 30;

async function getViewCount(postId) {
  try {
    const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
    if (!(await redisClient.exists(key))) {
      logger.info(`No views found in cache for postId=${postId}, attempting to restore from datastore.`);
      const viewsHll = await viewsDao.get(postId);
      if (viewsHll === null) {
        logger.error(`No views found in cache or datastore for postId=${postId}`);
        return 0;
      }
      await redisClient.set(key, viewsHll);
    }
    return await redisClient.pfcount(key);
  } catch (err) {
    logger.error(err.message);
    return 0;
  }
}

async function incrementViewCount(postId, userId) {
  logger.info(`Incrementing post views HLL for postId=${postId} userId=${userId}`);
  const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
  const isoDate = new Date().toISOString();
  const truncateIdx = isoDate.indexOf(':');
  // Unique hourly views
  const uniqueView = `${userId}:${isoDate.substr(0, truncateIdx)}`;
  await redisClient.pfadd(key, uniqueView);

  const viewCacheKey = `view_cache:${postId}`;
  if (!(await redisClient.exists(viewCacheKey))) {
    viewsDao.insert(postId, await redisClient.get(key));
    redisClient.set(viewCacheKey, 1);
    redisClient.expire(viewCacheKey, PERSIST_VIEWS_WINDOW_SECONDS);
  }
}

const insert = async (userId, body, lng, lat) => {
  const newPost = await postsDao.insert(userId, body, lng, lat);
  incrementViewCount(newPost.id, userId);
  return newPost;
};

const view = async (postId, userId) => {
  const post = await postsDao.findById(postId);
  if (post) {
    const key = `${POST_VIEWS_KEY_PREFIX}:${postId}`;
    const viewCount = await redisClient.pfcount(key);
    post.views = viewCount;
    const isViewCountCached = await redisClient.exists(key);

    if (!isViewCountCached) {
      logger.warn(`Post views not found in cache for postId=${postId}. Restoring from datastore.`);
      const postViewsHll = await viewsDao.get(postId);
      if (postViewsHll === null) {
        logger.warn(`Post views not found in datastore for postId=${postId}. Creating a new HLL.`);
        await incrementViewCount(postId, userId);
      } else {
        redisClient.set(key, postViewsHll);
      }
    } else {
      incrementViewCount(postId, userId);
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
  insert, view, findAllByLocation,
};

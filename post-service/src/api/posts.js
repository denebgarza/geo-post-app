import * as postsDao from '../dao/posts.js';

const MAX_RADIUS_METERS = 5000;
const POST_PREVIEW_LENGTH = 200;

const insert = async (userId, body, lng, lat) => {
  return await postsDao.insert(userId, body, lng, lat);
};

const findById = async (postId) => {
  return await postsDao.findById(postId);
};

const findAllByLocation = async (lng, lat, radiusMeters) => {
  radiusMeters = Math.min(parseInt(radiusMeters), MAX_RADIUS_METERS);

  const posts = await postsDao.findAllByLocation(parseFloat(lng), parseFloat(lat), parseInt(radiusMeters));
  for (const post of posts) {
    if (post.body.length > POST_PREVIEW_LENGTH) {
      post.body = post.body.substring(0, POST_PREVIEW_LENGTH);
    }
  }
  return posts;
};

export { insert, findById, findAllByLocation };
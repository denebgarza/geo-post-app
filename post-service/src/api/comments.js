import * as commentsDao from '../dao/comments.js';
import * as postsDao from '../dao/posts.js';
import parentLogger from '../logger.js';

const OP_DISPLAY_NAME = 'OP';

const logger = parentLogger.child({ module: 'comments-api' });

async function getDisplayName(postId, userId) {
  let displayName = OP_DISPLAY_NAME;
  const post = await postsDao.findById(postId);
  if (!post) {
    throw new Error(`Tried to insert comment for non-existent postId=${postId}`);
  }
  if (userId === post.user_id) {
    return displayName;
  }
  const existingComment = await commentsDao.findByPostIdAndUserId(post.id, userId);
  if (existingComment) {
    displayName = existingComment.display_name;
  } else {
    displayName = await commentsDao.generateDisplayName();
    let collidingComment = await commentsDao.findByPostIdAndDisplayName(post.id, displayName);
    while (collidingComment) {
      logger.warn(`Found display name collision displayName=${displayName} postId=${post.id} userId=${userId}`);
      displayName = commentsDao.generateDisplayName();
      // eslint-disable-next-line no-await-in-loop
      collidingComment = await commentsDao.findByPostIdAndDisplayName(post.id, displayName);
    }
  }
  if (!displayName) {
    throw new Error('Could not get or generate a display name');
  }
  return displayName;
}

// TODO: Check for distance cheating
const insert = async (postId, userId, body) => {
  logger.info(`Inserting comment for postId=${postId} userId=${userId}`);
  const displayName = await getDisplayName(postId, userId);
  const newComment = await commentsDao.insert(postId, userId, body, displayName);
  await postsDao.incrCommentCount(postId);
  return newComment;
};

// TODO: Check for distance cheating
const findByPostId = async (postId) => commentsDao.findByPostId(postId);

export { insert, findByPostId };

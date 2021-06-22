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
const insert = async (postId, parentCommentId, userId, body) => {
  if (parentCommentId) {
    logger.info(`Inserting comment for postId=${postId} userId=${userId}`);
  } else {
    logger.info(`Inserting comment reply for postId=${postId} parentCommentId=${parentCommentId} userId=${userId}`);
  }
  const displayName = await getDisplayName(postId, userId);
  const newComment = await commentsDao.insert(postId, parentCommentId, userId, body, displayName);
  await postsDao.incrCommentCount(postId);
  return newComment;
};

// TODO: Check for distance cheating
const findByPostId = async (postId) => {
  const allComments = await commentsDao.findByPostId(postId);
  const replies = allComments.filter((comment) => !!comment.parent_comment_id);
  const repliesByParentId = {};
  replies.forEach((reply) => {
    if (!repliesByParentId[reply.parent_comment_id]) {
      repliesByParentId[reply.parent_comment_id] = [];
    }
    repliesByParentId[reply.parent_comment_id].push(reply);
  });
  const comments = allComments.filter((comment) => !comment.parent_comment_id);
  comments.forEach((comment) => {
    if (repliesByParentId[comment.id]) {
      comment.replies = repliesByParentId[comment.id];
    }
  });
  return comments;
};

// TODO: Check for distance cheating
const findReplies = async (parentCommentId) => commentsDao.findReplies(parentCommentId);

export { insert, findByPostId, findReplies };

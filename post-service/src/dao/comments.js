import MUUID from 'uuid-mongodb';
import commons from 'commons';
import parentLogger from '../logger.js';
import { getCollection, collections } from './mongodb.js';

const logger = parentLogger.child({ module: 'comments-dao' });

const { transformId } = commons.mongodb;

const generateDisplayName = async () => {
  const wordsCollection = getCollection(collections.ENGLISH_WORDS);
  const threeWords = await wordsCollection.aggregate([
    { $sample: { size: 3 } },
  ]).toArray();
  return threeWords.map((obj) => obj.word).join('');
};

const findByPostIdAndDisplayName = async (postId, displayName) => {
  logger.info(`Finding comments for displayName=${displayName} and postId=${postId}`);
  const collection = getCollection(collections.COMMENTS);
  return collection.findOne({ display_name: displayName, post_id: postId });
};

const findByPostIdAndUserId = async (postId, userId) => {
  logger.info(`Finding comments for userId=${userId} and postId=${postId}`);
  const collection = getCollection(collections.COMMENTS);
  return collection.findOne({ user_id: userId, post_id: postId });
};

const findByPostId = async (postId) => {
  logger.info(`Finding comments for postId=${postId}`);
  const collection = getCollection(collections.COMMENTS);
  const comments = await collection.find(
    { post_id: postId },
    { user_id: 0 },
  ).sort({ update_date: 1 });
  const commentsArray = await comments.toArray();
  commentsArray.forEach((comment, idx, arr) => transformId(arr[idx]));
  return commentsArray;
};

const findReplies = async (parentCommentId) => {
  logger.info(`Finding comment replies for parentCommentIt=${parentCommentId}`);
  const collection = getCollection(collections.COMMENTS);
  const comments = await collection.find(
    { parent_comment_id: parentCommentId },
  ).sort({ update_date: 1 });
  const commentsArray = await comments.toArray();
  commentsArray.forEach((comment, idx, arr) => transformId(arr[idx]));
  return commentsArray;
};

const insert = async (postId, parentCommentId, userId, body, displayName) => {
  const uuid = MUUID.v4();
  logger.info(`Inserting commentId=${uuid} for postId=${postId} userId=${userId}`);
  const collection = getCollection(collections.COMMENTS);
  const comment = {
    _id: uuid,
    post_id: postId,
    user_id: userId,
    display_name: displayName,
    body,
    create_date: new Date(Date.now()),
    update_date: new Date(Date.now()),
  };
  if (parentCommentId) {
    comment.parent_comment_id = parentCommentId;
  }
  const result = await collection.insertOne(comment);
  if (result.result.ok !== 1) throw Error('Could not insert new comment');
  const newComment = result.ops[0];
  transformId(newComment);

  return newComment;
};

export {
  insert,
  findByPostId,
  findReplies,
  findByPostIdAndDisplayName,
  findByPostIdAndUserId,
  generateDisplayName,
};

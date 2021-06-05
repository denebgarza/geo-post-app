import express from 'express';
import * as postsApi from '../api/posts.js';
import * as commentsApi from '../api/comments.js';
import parentLogger from '../logger.js';

const logger = parentLogger.child({ module: 'posts-route' });

const router = express.Router();

router.post('/:postId/comments', async (req, res) => {
  try {
    const newComment = await commentsApi.insert(req.params.postId, req.user.id, req.body.body);
    res.status(201).send(newComment);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

router.get('/:postId/comments/:lng/:lat', async (req, res) => {
  try {
    const comments = await commentsApi.findByPostId(req.params.postId);
    res.status(200).send(comments);
  } catch (err) {
    logger.error(err);
    return res.sendStatus(500);
  }
});

router.get('/:lnglat/:radiusMeters', async (req, res) => {
  try {
    const coords = req.params.lnglat.split(',');
    const posts = await postsApi.findAllByLocation(coords[0], coords[1], req.params.radiusMeters);
    res.send(posts);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await postsApi.view(postId, req.user.id);
    res.send(post);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

router.post('/', async (req, res) => {
  try {
    const newPost = await postsApi.insert(
      req.user.id, req.body.body, req.body.lng, req.body.lat,
    );
    res.send(newPost);
  } catch (err) {
    logger.error(err);
    res.sendStatus(500);
  }
});

export default router;

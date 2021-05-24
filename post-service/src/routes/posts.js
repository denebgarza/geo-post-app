import express from 'express';
import * as postsApi from '../api/posts.js';
import logger from '../logger.js';

const router = express.Router();

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
  const { postId } = req.params;
  const post = await postsApi.findById(postId);
  res.send(post);
});

router.post('/', async (req, res) => {
  const newPost = await postsApi.insert(
    req.user.id, req.body.body, req.body.lng, req.body.lat,
  );
  res.send(newPost);
});

export default router;

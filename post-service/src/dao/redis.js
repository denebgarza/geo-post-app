import redis from 'async-redis';
import config from '../config.js';

const redisClient = redis.createClient({
  ...config.redis,
  return_buffers: true,
});

export default redisClient;

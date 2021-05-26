import redis from 'async-redis';
import config from '../config.js';

const redisClient = redis.createClient({
  ...config.redis,
});

export default redisClient;

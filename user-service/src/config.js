import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const config = {
  app: {
    name: `user-service-${env}`,
    port: process.env.EXPRESS_PORT || 3000,
  },
  redis: {
    host: 'redis-server',
    port: 6379,
  },
};
config.env = env;

export default config;

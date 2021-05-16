const env = process.env.NODE_ENV || 'development';

const config = {
  app: {
    name: `user-service-${env}`,
    port: process.env.EXPRESS_PORT || 3000,
    jwt_secret: process.env.JWT_SECRET,
  },
  redis: {
    host: 'redis-server',
    port: 6379,
  },
  mongodb: {
    host: 'mongodb-server',
    port: 27017,
    database: 'user-service',
    username: 'root',
    password: 'mongopass',
  },
  env,
};

export default config;

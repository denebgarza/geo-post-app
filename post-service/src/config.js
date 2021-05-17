const env = process.env.NODE_ENV || 'development';

const config = {
  app: {
    name: `post-service-${env}`,
    port: process.env.EXPRESS_PORT || 3000,
    jwt_secret: process.env.JWT_SECRET,
  },
  mongodb: {
    host: 'mongodb-server',
    port: 27017,
    database: 'post-service',
    username: 'root',
    password: 'mongopass',
  },
  env,
};

export default config;

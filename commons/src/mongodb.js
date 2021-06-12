const mongodb = require('mongodb');

const initMongoDb = async (username, password, host, port, database) => {
  const { MongoClient } = mongodb;
  const mongoClient = new MongoClient(
    `mongodb://${username}:${password}@${host}:${port}`,
  );
  await mongoClient.connect();
  return mongoClient.db(database);
};

exports.initMongoDb = initMongoDb;

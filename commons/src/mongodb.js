/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongodb = require('mongodb');
const MUUID = require('uuid-mongodb');

/*
  Boilerplate code to initialize a mongodb connection.
  Returns a database object.
*/
const initMongoDb = async (username, password, host, port, database) => {
  const { MongoClient } = mongodb;
  const mongoClient = new MongoClient(
    `mongodb://${username}:${password}@${host}:${port}`,
  );
  await mongoClient.connect();
  return mongoClient.db(database);
};

/*
  Util used to convert a BSON document's Binary UUID "_id" field
  into a javascript object UUID string "id" field.
*/
const transformId = (document) => {
  if (document) {
    const uuid = MUUID.from(document._id);
    delete document._id;
    document.id = uuid.toString();
  }
};

exports.initMongoDb = initMongoDb;
exports.transformId = transformId;

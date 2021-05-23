/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import MUUID from 'uuid-mongodb';

const uuidIdToString = (document) => {
  if (document) {
    const uuid = MUUID.from(document._id);
    delete document._id;
    document.id = uuid.toString();
  }
};

export default uuidIdToString;

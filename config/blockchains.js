/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
module.exports = {
  'eth': {
    key: 'eth',
    rabbit: {
      url: process.env.RABBIT_URI || 'amqp://localhost:5672',
      exchange: process.env.RABBIT_EXCHANGE || 'events',
      serviceName: process.env.RABBIT_SERVICE_NAME || 'app_eth' 
    },
    mongo: {
      uri: process.env.MONGO_DATA_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/data',
      collectionPrefix: process.env.MONGO_DATA_COLLECTION_PREFIX || process.env.MONGO_COLLECTION_PREFIX || 'eth'
    },
    rest: {
      url: 'http://localhost:8085'
    },
    node: process.env.ETH_NODE || `http://localhost:8545`,
    waitBlockLimit: 2
  }
};

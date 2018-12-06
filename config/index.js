/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
require('dotenv').config();
const constants = require('./constants');

const _ = require('lodash');

module.exports = {
  http: {
    port: parseInt(process.env.REST_PORT) || 8081,
  },
  mongo: {
    collectionPrefix: process.env.MONGO_COLLECTION_PREFIX || 'eos_account',
    data: { uri: process.env.MONGO_URI || 'mongodb://localhost:27017/data' }
  },
  rabbit: {
    url: process.env.RABBIT_URI || 'amqp://localhost:5672',
    exchange: process.env.RABBIT_EXCHANGE || 'events',
    serviceName: process.env.RABBIT_SERVICE_NAME || 'eos_account' 
  },
  exchange: {
    key: process.env.COINMARKET_KEY || '19710063-e7ab-45bf-808d-88764a3e8899',
    provider: constants.providers.COINMARKETCAP
  },
  eos: {
    url: process.env.EOS_NODE || 'http://dev.cryptolions.io:38888',
    mainAccount: process.env.EOS_ACCOUNT,
    mainKey: process.env.EOS_KEY
  },
  system: {
    rabbit: {
      url: process.env.SYSTEM_RABBIT_URI || process.env.RABBIT_URI || 'amqp://localhost:5672',
      exchange: process.env.SYSTEM_RABBIT_EXCHANGE || 'internal',
      serviceName: process.env.SYSTEM_RABBIT_SERVICE_NAME || 'system' 
    },
    waitTime: process.env.SYSTEM_WAIT_TIME ? parseInt(process.env.SYSTEM_WAIT_TIME) : 10000, 
    checkSystem: process.env.CHECK_SYSTEM ? parseInt(process.env.CHECK_SYSTEM) : true,
  },
  signingsService: {
    id: 'middleware_signing_service',
    address: process.env.SIGN_ADDRESS,
    url: process.env.SIGNING_SERVICE_URI || 'http://localhost:8080'
  },
  oauthService: {
    url: process.env.OAUTH_SERVICE_URI || 'http://localhost:8082'
  },
  blockchains: require('./blockchains'),
  id: process.env.NAME || 'middleware_eos_account',
  secret: process.env.SECRET || '123'
};

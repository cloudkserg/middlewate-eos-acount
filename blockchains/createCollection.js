const config = require('../config'),
  _ = require('lodash'),
  createBlockchain = require('./fabric');
module.exports = () => {
  return _(config.blockchains).keys()
    .map((key) => createBlockchain(key))
    .compact()
    .value();   
};

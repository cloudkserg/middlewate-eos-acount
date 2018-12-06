const constants = require('../config/constants'),
  Eth = require('./Eth');
module.exports = (blockchainKey) => {
  const chains = {
    [`${constants.blockchains.ETH}`]: Eth
  };
  if (!chains[blockchainKey]) 
    throw new Error('not found right blockchain for key ' + blockchainKey);
  return new (chains[blockchainKey]);
};

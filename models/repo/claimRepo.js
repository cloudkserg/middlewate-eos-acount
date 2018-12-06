const models = require('../../models'),
  constants = require('../../config/constants');

const checkEosChangeOpportunity = (claim) => {
  return (claim.status !== constants.statuses.creating && claim.status !== constants.statuses.created);
};

module.exports = {
  async create (blockchain, eosAddress, eosOwnerKey, eosActiveKey, address, price, userId) {
    const claim = new models.claimModel({
      blockchain: blockchain,
      status: constants.statuses.open,
      eosAddress: eosAddress,
      eosOwnerKey: eosOwnerKey,
      eosActiveKey: eosActiveKey,
      address: address,
      userId,
      amount: '0',
      requiredAmount: price
    });
    return await claim.save();
  },


  async getOpenClaims (blockchainKey) {
    return await models.claimModel.find({
      blockchain: blockchainKey,
      status: constants.statuses.open
    });
  },

  async updateCreated (claim) {
    claim.status = constants.statuses.created;
    await claim.save();

    const account = await models.addressModel.findOne({address: claim.address});
    account.busy = true;
    account.save();
  },

  async updateNotCreated (claim) {
    claim.status = constants.statuses.notCreated;
    await claim.save();

    const account = await models.addressModel.findOne({address: claim.address});
    account.busy = true;
    account.save();
  },

  async updateOpening (claim, txs, amount, blockNumber) {
    claim.txs = txs;
    claim.amount = amount;
    if (!claim.startBlock)
      claim.startBlock = blockNumber;
    claim.endBlock = blockNumber;
    return await claim.save();
  },

  async updatePaid (claim, txs, amount, endBlock) {
    claim.txs = txs;
    claim.amount = amount;
    claim.endBlock = endBlock;
    claim.status = constants.statuses.paid;
    return await claim.save();
  },

  async updateTimeout (claim, txs, amount, endBlock) {
    claim.txs = txs;
    claim.amount = amount;
    claim.endBlock = endBlock;
    claim.status = constants.statuses.timeout;
    return await claim.save();
  },


  async update (claim, data, status) {
    if (data.eosAddress) {
      checkEosChangeOpportunity(claim);
      claim.eosAddress = data.eosAddress;
    }

    if (data.eosOwnerKey)  {
      checkEosChangeOpportunity(claim);
      claim.eosOwnerKey = data.eosOwnerKey;
    }

    if (data.eosActiveKey) {
      checkEosChangeOpportunity(claim);
      claim.eosActiveKey = data.eosActiveKey;
    }
    
    
    if (status) 
      claim.status = status;

    await claim.save();
    return claim;
  }
};


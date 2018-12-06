const models = require('../../models');
module.exports = {
  async getBusyIndex () {
    const items = await models.addressModel.find({
      busy: true
    }).sort({index: -1}).limit(1);
    if (!items[0]) 
      return 1;
    return items[0].index;
  },
  async getFreeAddress (blockchainName) {
    const items = await models.addressModel.find({
      blockchain: blockchainName,
      busy: false
    }).sort({index: 1}).limit(1);
    if (!items[0])
      return null;
    return items[0].address;
  },

  async save (address, index, blockchain) {
    const item = new models.addressModel;
    item.address = address;
    item.index =index;
    item.blockchain = blockchain;
    item.busy = false;
    await item.save();
    return item;
  },

  async setBusy (address) {
    await models.addressModel.findOneAndUpdate({address}, { busy: true}); 
  } 
};

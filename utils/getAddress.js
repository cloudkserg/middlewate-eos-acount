const addressRepo = require('../models/repo/addressRepo');

module.exports = async (blockchain) => {
  let address = await addressRepo.getFreeAddress(blockchain.getName());
  if (!address) {
    const lastBusyIndex = await addressRepo.getBusyIndex();
    address = await blockchain.getAddress(lastBusyIndex+1);
    await addressRepo.save(address, lastBusyIndex+1, blockchain.getName());
  }
  return address;
};

const Web3 = require('web3'),
  net = require('net'),
  config = require('../config'),
  _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  constants = require('../config/constants'),
  models = require('../models'),
  OwnAmqpService = require('../services/AmqpService'),
  getPrivateKey = require('../utils/signing/getPrivateKey');

class Eth {
  constructor () {
    this.web3 = new Web3();
    this.config = config.blockchains[this.getName()];
  }

  getName () {
    return constants['blockchains']['ETH'];
  }

  getBlockLimit () {
    return this.config.waitBlockLimit;
  }

  async getAddress (index) {
    const privateKey = await getPrivateKey(this.getName(), index);
    const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    return account.address.toLowerCase();
  }

  async startListen () {
    this.service = new OwnAmqpService(
      this.config.rabbit.url, 
      this.config.rabbit.exchange,
      this.config.rabbit.serviceName
    );
    await this.service.start();
    await this.service.addBind(`${this.config.rabbit.serviceName}_block`, 'BLOCK');
  }

  onBlock (cb) {
    this.service.on('BLOCK', async (response) => {
      await cb(response.block);
    });
  }
    
  setProvider () {
    const providerURI = this.config.node;
    const provider = /^http/.test(providerURI) ? new Web3.providers.HttpProvider(providerURI) : new Web3.providers.IpcProvider(`${/^win/.test(process.platform) ? '\\\\.\\pipe\\' : ''}${providerURI}`, net);
    this.web3.setProvider(provider);
  }

  async getFee (amountInWei) {
    this.setProvider();
    return await this.web3.eth.estimateGas({
      from: '0xEDA8A2E1dfA5B93692D2a9dDF833B6D7DF6D5f93', 
      to: '0xEDA8A2E1dfA5B93692D2a9dDF833B6D7DF6D5f93', 
      amount: amountInWei
    });
  }

  async getTxs (address) {
    return await models.ethTxModel.find({
      to: address
    });
  }

  sumTxs (txs) {
    return _.reduce(txs, (sum, tx) => {
      sum = sum.plus(new BigNumber(tx.value));
      return sum;
    }, new BigNumber(0));
  }

  getDecimalPrice (price) {
    return new BigNumber(
      this.web3.utils.toWei(price.toFixed(18).toString(), 'ether')
    ); 
  }
}


module.exports = Eth;

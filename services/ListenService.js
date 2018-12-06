const _ = require('lodash'),
  BigNumber = require('bignumber.js'),
  claimRepo =require('../models/repo/claimRepo'),
  EventEmitter = require('events'),
  PaidEvent = require('../events/PaidEvent'),
  AmountEvent = require('../events/AmountEvent'),
  TimeoutEvent = require('../events/TimeoutEvent'),
  Promise = require('bluebird');



class ListenService {
  constructor (blockchain) {
    this.EVENT = 'EVENT';
    this.blockchain = blockchain;
    this.events = new EventEmitter();
  }

  async start () {
    await this.blockchain.startListen();
    this.binder = this.blockchain.onBlock(async (blockNumber) => await this.parseBlock(blockNumber));
  }

  async parseBlock (blockNumber) {
    const claims = await claimRepo.getOpenClaims(this.blockchain.getName());
    await Promise.mapSeries(claims, async claim => await this.parseOpenClaim(blockNumber, claim));
  }

  async send (event, claim) {
    this.events.emit(this.EVENT, event, claim);
  }

  async parseOpenClaim (blockNumber, claim) {
    const txs = await this.blockchain.getTxs(claim.address);
    const txIds = _.map(txs, tx => tx._id);
    const amount = this.blockchain.sumTxs(txs);
    const requiredAmount = new BigNumber(claim.requiredAmount);
    
    if (claim.endBlock - claim.startBlock > this.blockchain.getBlockLimit())
      if (amount.isGreaterThanOrEqualTo(requiredAmount)) { 
        await claimRepo.updatePaid(claim, txIds, amount, blockNumber);
        await this.send(new PaidEvent(claim), claim);
      } else {
        await claimRepo.updateTimeout(claim, txIds, amount, blockNumber);
        await this.send(new TimeoutEvent(claim), claim);
      }
    else {
      await claimRepo.updateOpening(claim, txIds, amount, blockNumber);
      if (amount.isGreaterThanOrEqualTo(requiredAmount)) 
        await this.send(new AmountEvent(claim), claim);
    }
  }

}

module.exports = ListenService;


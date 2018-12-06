const claimRepo =require('../models/repo/claimRepo'),
  EventEmitter = require('events'),
  CreatedEvent = require('../events/CreatedEvent'),
  createEosAccount = require('../eos/createEosAccount'),
  NotCreatedEvent = require('../events/NotCreatedEvent');



class GeneratorEosAccount {
  constructor () {
    this.EVENT = 'EVENT';
    this.GENERATE = 'GENERATE';
    this.events = new EventEmitter();
  }

  async start () {
    this.binder = this.events.on(this.GENERATE, async (claim) => await this.generate(claim));
  }

  async send (event, claim) {
    this.events.emit(this.EVENT, event, claim);
  }

  async generate (claim) {
    try {
      await createEosAccount(claim.eosAddress, claim.eosOwnerKey, claim.eosActiveKey);
      await claimRepo.updateCreated(claim);
      await this.send(new CreatedEvent(claim), claim);
    } catch (e) {
      await claimRepo.updateNotCreated(claim);
      await this.send(new NotCreatedEvent(claim), claim);
      throw e;
    }
    // if (Math.random()*10 < 5) {

    // } else {

    // }
  }


}

module.exports = GeneratorEosAccount;


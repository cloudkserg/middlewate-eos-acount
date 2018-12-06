/**
 * Mongoose model. Accounts
 * @module models/accountModel
 * @returns {Object} Mongoose model
 * @requires factory/addressMessageFactory
 * 
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
*/


const mongoose = require('mongoose'),
  config = require('../config');

const Claim = new mongoose.Schema({
  address: {type: String, index: true},
  status: {type: String, index: true},
  reason: {type: mongoose.Schema.Types.Mixed},
  eosAddress: {type: String},
  eosOwnerKey: {type: String},
  eosActiveKey: {type: String},
  txs: [{type: String}],
  userId: {type: String},
  blockchain: {type: String, index: true},
  startBlock: {type: Number},
  endBlock: {type: Number},
  amount: {type: String},
  requiredAmount: {type: String},
  timestamp: {type: Number, default: Date.now}
});

module.exports = ()=>
  mongoose.model(`${config.mongo.collectionPrefix}Claim`, Claim);

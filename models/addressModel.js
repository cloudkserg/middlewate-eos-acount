/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

/**
 * Mongoose model. Represents a transaction in eth
 * @module models/txModel
 * @returns {Object} Mongoose model
 */

const mongoose = require('mongoose'),
  config = require('../config');

const Address = new mongoose.Schema({
  address: {type: String, index: true, unique: true},
  blockchain: {type: String},
  busy: {type: Boolean, default: false},
  index: {type: Number, default: 1}
});

Address.index({blockchain: 1, busy: 1});

module.exports = () =>
  mongoose.model(`${config.mongo.collectionPrefix}Address`, Address);

/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/

const mongoose = require('mongoose'),
  config = require('../config'),
  models = require('../models'),
  Promise = require('bluebird');
module.exports = async () => {
    mongoose.Promise = Promise;
    mongoose.connect(config.mongo.data.uri, { useNewUrlParser: true});
    mongoose.set('useCreateIndex', true);
    mongoose.eth = mongoose.createConnection(
        config.blockchains['eth'].mongo.uri, {useNewUrlParser: true});
  
  [mongoose.eth, mongoose.connection].forEach(connection =>
    connection.on('disconnected', () => {
      throw new Error('mongo disconnected!');
    })
  );

  models.init();
};

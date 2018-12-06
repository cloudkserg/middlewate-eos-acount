/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');
process.env.LOG_LEVEL = 'error';

const config = require('./config'),
  models = require('../models'),
  fuzzTests = require('./fuzz'),
  performanceTests = require('./performance'),
  featuresTests = require('./features'),
  blockTests = require('./blocks'),
  Promise = require('bluebird'),
  mongoose = require('mongoose'),
  providerService = require('../services/providerService'),
  amqp = require('amqplib'),
  ctx = {};

mongoose.Promise = Promise;
mongoose.connect(config.mongo.data.uri, {useMongoClient: true});
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri, {useMongoClient: true});


describe('core/blockProcessor', function () {

  before (async () => {
    models.init();

    ctx.accounts = config.dev.accounts;
    if (ctx.accounts[0].address.length === 0)
        throw new Error('Not set addresses in environment for tests');
    ctx.amqp = {};
    ctx.api = await providerService.get();
    ctx.amqp.instance = await amqp.connect(config.rabbit.url);
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();
    await ctx.amqp.channel.assertExchange('events', 'topic', {durable: false});
    await ctx.amqp.channel.assertExchange('internal', 'topic', {durable: false});
    await ctx.amqp.channel.assertQueue(`${config.rabbit.serviceName}_current_provider.get`, {durable: false});
    await ctx.amqp.channel.bindQueue(`${config.rabbit.serviceName}_current_provider.get`, 'internal', `${config.rabbit.serviceName}_current_provider.get`);

  });

  after (async () => {
    mongoose.disconnect();
    mongoose.accounts.close();
    await ctx.amqp.instance.close();
  });


  describe('block', () => blockTests(ctx));

  describe('fuzz', () => fuzzTests(ctx));

  describe('performance', () => performanceTests(ctx));

  describe('features', () => featuresTests(ctx));

});

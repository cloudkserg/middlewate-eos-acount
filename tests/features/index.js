/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');

const models = require('../../models'),
  config = require('../../config'),
  sender = require('../utils/sender'),
  expect = require('chai').expect,
  Promise = require('bluebird'),
  spawn = require('child_process').spawn;

module.exports = (ctx) => {

  before (async () => {
    await models.blockModel.remove({});
    await models.txModel.remove({});
    await models.actionModel.remove({});
    await models.accountModel.remove({});
    await models.accountTxModel.remove({});

    ctx.blockProcessorPid = spawn('node', ['index.js'], {env: process.env, stdio: 'ignore'});
    await Promise.delay(10000);
  });

  it('validate block event', async () => {

    const generatedBlockNumbers = [];

    await Promise.all([
      (async () => {
        await ctx.amqp.channel.assertQueue(`app_${config.rabbit.serviceName}_test_features.block`);
        await ctx.amqp.channel.bindQueue(`app_${config.rabbit.serviceName}_test_features.block`, 'events', `${config.rabbit.serviceName}_block`);
        await new Promise(res =>
          ctx.amqp.channel.consume(`app_${config.rabbit.serviceName}_test_features.block`, async data => {
            if (!data)
              return;

            const message = JSON.parse(data.content.toString());
            expect(message).to.have.all.keys('block');

            const lastNumber = generatedBlockNumbers.shift();
            if (generatedBlockNumbers.length && lastNumber == 3)
              return;

            await ctx.amqp.channel.deleteQueue(`app_${config.rabbit.serviceName}_test_features.block`);
            res();
          }, {noAck: true})
        );
      })(),
      (async () => {
        for (let number = 1; number <= 3; number++) {
          await sender.sendTransaction(
            ctx.api,
            ctx.accounts,
            {value: '0.0001'});
          generatedBlockNumbers.push(number);
        }
      })()
    ]);
  });

  it('validate transaction event for registered user', async () => {

    await new models.accountModel({address: ctx.accounts[0].address}).save();

    let tx;

    return await Promise.all([
      (async () => {
        await ctx.amqp.channel.assertQueue(`app_${config.rabbit.serviceName}_test_features.transaction`);
        await ctx.amqp.channel.bindQueue(`app_${config.rabbit.serviceName}_test_features.transaction`, 'events',
          `${config.rabbit.serviceName}_transaction.${ctx.accounts[0].address}`);
        await new Promise(res =>
          ctx.amqp.channel.consume(`app_${config.rabbit.serviceName}_test_features.transaction`, async data => {

            if (!data)
              return;

            const message = JSON.parse(data.content.toString());

            expect(message).to.have.keys('id', 'blockNumber', 'index');
            if (tx && message.id !== tx.transaction_id)
              return;

            await ctx.amqp.channel.deleteQueue(`app_${config.rabbit.serviceName}_test_features.transaction`);
            res();
          }, {noAck: true})
        );
      })(),
      (async () => {
        const objTx = await sender.sendTransaction(
          ctx.api,
          ctx.accounts,
          {value: '0.0001'}
        );
        tx = objTx.tx;
      })()
    ]);
  });


  it('validate transaction event for not registered user', async () => {
    let tx;

    return await Promise.all([
      (async () => {
        await ctx.amqp.channel.assertQueue(`app_${config.rabbit.serviceName}_test_features.transaction`);
        await ctx.amqp.channel.bindQueue(`app_${config.rabbit.serviceName}_test_features.transaction`, 
          'events', `${config.rabbit.serviceName}_transaction.${ctx.accounts[1].address}`);
        await new Promise((res, rej) => {
          ctx.amqp.channel.consume(`app_${config.rabbit.serviceName}_test_features.transaction`, (data) => {
            if (data)
              rej();
          }, {noAck: true});

          let checkInterval = setInterval(async () => {

            if (!tx)
              return;

            let txExist = await models.txModel.count({_id: tx.transaction_id});

            if (!txExist)
              return;

            clearInterval(checkInterval);
            await ctx.amqp.channel.deleteQueue(`app_${config.rabbit.serviceName}_test_features.transaction`);
            res();
          }, 2000);
        });
      })(),
      (async () => {
        const objTx = await sender.sendTransaction(
          ctx.api,
          ctx.accounts,
          {value: '0.0001'}
        );
        tx = objTx.tx;
      })()
    ]);
  });


  after('kill environment', async () => {
    ctx.blockProcessorPid.kill();
  });


};

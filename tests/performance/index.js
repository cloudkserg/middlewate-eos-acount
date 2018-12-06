/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const config = require('../../config'),
  models = require('../../models'),
  spawn = require('child_process').spawn,
  expect = require('chai').expect,
  Promise = require('bluebird'),
  SyncCacheService = require('../../services/syncCacheService'),
  BlockWatchingService = require('../../services/blockWatchingService'),
  sender = require('../utils/sender');

module.exports = (ctx) => {

  before (async () => {
    await models.blockModel.remove({});
    await models.txModel.remove({});
    await models.actionModel.remove({});
    await models.accountModel.remove({});
    await models.accountTxModel.remove({});
    global.gc();
  });


  it('validate sync cache service performance', async () => {
    let blockNumber = await ctx.api.getHeight();
    const addBlocksCount = 50 - blockNumber;

    if (addBlocksCount > 0)
      for (let i = 0; i < addBlocksCount; i++)
        await sender.sendTransaction(ctx.api, ctx.accounts, {value: '0.0001'});

    blockNumber = await ctx.api.getHeight();
    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;
    const syncCacheService = new SyncCacheService();
    syncCacheService.doJob([[blockNumber - 50, blockNumber]]);
    await new Promise(res => syncCacheService.once('end', res));
    global.gc();
    await Promise.delay(5000);
    const memUsage2 = process.memoryUsage().heapUsed / 1024 / 1024;

    expect(memUsage2 - memUsage).to.be.below(3);
  });

  it('validate block watching service performance', async () => {
    let blockNumber = await ctx.api.getHeight();
    const addBlocksCount = 50 - blockNumber;

    if (addBlocksCount > 0)
      for (let i = 0; i < addBlocksCount; i++)
        await sender.sendTransaction(ctx.api, ctx.accounts, {value: '0.0001'});


    const memUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    const blockWatchingService = new BlockWatchingService(blockNumber);
    await blockWatchingService.startSync();
    await Promise.delay(20000);
    await blockWatchingService.stopSync();
    global.gc();
    await Promise.delay(60000);
    const memUsage2 = process.memoryUsage().heapUsed / 1024 / 1024;

    expect(memUsage2 - memUsage).to.be.below(3);
  });


  it('validate tx notification speed', async () => {
    ctx.blockProcessorPid = spawn('node', ['index.js'], {
      stdio: 'ignore'
    });
    await Promise.delay(10000);
    await new models.accountModel({address: ctx.accounts[0].address}).save();

    let tx;
    let start;
    let end;

    await Promise.all([
      (async () => {
        await ctx.amqp.channel.assertQueue(`app_${config.rabbit.serviceName}_test_performance.transaction`);
        await ctx.amqp.channel.bindQueue(`app_${config.rabbit.serviceName}_test_performance.transaction`, 'events',
          `${config.rabbit.serviceName}_transaction.${ctx.accounts[0].address}`);
        await new Promise(res =>
          ctx.amqp.channel.consume(`app_${config.rabbit.serviceName}_test_performance.transaction`, async data => {

            if (!data)
              return;

            const message = JSON.parse(data.content.toString());

            if (tx && message.id !== tx.transaction_id)
              return;

            end = Date.now();
            await ctx.amqp.channel.deleteQueue(`app_${config.rabbit.serviceName}_test_performance.transaction`);
            res();

          }, {noAck: true, autoDelete: true})
        );
      })(),
      (async () => {
        const objTx = await sender.sendTransaction(
          ctx.api,
          ctx.accounts,
          {value: '0.0001'}
        );
        tx = objTx.tx;
        start = Date.now();
      })()
    ]);

    expect(end - start).to.be.below(2000);
    await Promise.delay(15000);
    ctx.blockProcessorPid.kill();
  });



};

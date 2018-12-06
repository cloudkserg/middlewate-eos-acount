/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

const models = require('../../models'),
  _ = require('lodash'),
  sender = require('../utils/sender'),
  waitTransaction = require('../utils/waitTransaction'),
  filterTxsByAccountsService = require('../../services/filterTxsByAccountService'),
  getBlock = require('../../utils/blocks/getBlock'),
  addBlock = require('../../utils/blocks/addBlock'),
  allocateBlockBuckets = require('../../utils/blocks/allocateBlockBuckets'),
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
  });


  it('get block', async () => {
    const blockNumber = await ctx.api.getHeight();
    const block = await getBlock(blockNumber);

    expect(block).to.contains.keys('timestamp', 'number', 'confirmed', 'transaction_mroot', 'action_mroot',
      'schedule_version', 'block_num', 'id', 'ref_block_prefix', 'previous', 'new_producers', 
      'header_extensions', 'block_extensions'
    );

    expect(block.block_num).to.equal(blockNumber);

    for (let trx of block.transactions) {
      const tx = trx.trx;
      if (tx instanceof Object) {
        expect(tx).to.contains.keys('id');
        expect(tx.transaction).to.contains.keys('expiration', 'delay_sec',
          'ref_block_num', 'ref_block_prefix', 'transaction_extensions', 'actions'
        );
        for (let action of tx.transaction.actions) 
          expect(action).to.contains.keys(
            'account', 'name', 'authorization', 'data');
      }
    }

  });


  it('add block', async () => {

    const blockNumber = await ctx.api.getHeight();
    const block = await ctx.api.getBlockByNumber(blockNumber);

    const blockCopy = _.cloneDeep(block);
    await addBlock(block);

    expect(_.isEqual(block, blockCopy)).to.equal(true); //check that object hasn't been modified

    const isBlockExists = await models.blockModel.count({_id: block.id});
    expect(isBlockExists).to.equal(1);
  });

  it('find missed blocks', async () => {



    ctx.blockProcessorPid = spawn('node', ['index.js'], {
      stdio: 'ignore'
    });
    await Promise.delay(30000);
    ctx.blockProcessorPid.kill();
    const height = await ctx.api.getHeight();

    let blocks = [];
    for (let i = height; i < height - 100; i--)
      blocks.push(i);
    blocks = _.shuffle(blocks);
    const blocksToRemove = _.take(blocks, 50);
    await models.blockModel.remove({number: {$in: blocksToRemove}});
    const buckets = await allocateBlockBuckets();
    expect(buckets.height).to.gt(blocksToRemove.length);

    let blocksToFetch = [];
    for (let bucket of buckets.missedBuckets) {
      if (bucket.length === 1) {
        blocksToFetch.push(...bucket);
        continue;
      }

      for (let blockNumber = _.last(bucket); blockNumber >= bucket[0]; blockNumber--)
        blocksToFetch.push(blockNumber);
    }

    expect(_.intersection(blocksToFetch, blocksToRemove).length).to.equal(blocksToRemove.length);

  });

  it('check filterTxsByAccountsService', async () => {

    await models.accountModel.create({address: ctx.accounts[0].address});

    const tx = await waitTransaction(ctx.api, sender.sendTransaction.bind(null, 
      ctx.api, ctx.accounts, {value: '1.0000'}
    ));
    const block = await ctx.api.getBlockByNumber(tx.block_num);
    const savedBlock = await addBlock(block);

    const filtered = await filterTxsByAccountsService(savedBlock.transactions);
    expect(!!_.find(filtered, f => f.address === ctx.accounts[0].address)).to.eq(true);
    expect(!!_.find(filtered, f => f.address === ctx.accounts[1].address)).to.eq(false);
  });


};

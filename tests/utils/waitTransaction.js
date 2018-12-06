/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const _ = require('lodash');

/**
 * @param {Function} sendTransaction
 */
module.exports = async (api, sendTransaction) => {
  let tx; 
  let lastBlock = await api.getHeight();
  const resTx = await Promise.all([
    new Promise(res => {
      let intervalPid = setInterval(async () => {
        if (!tx) 
          return; 
        const newBlock = await api.getBlockByNumber(lastBlock+1).catch(() => null);
        if (!newBlock)
          return;
        lastBlock++;
        const txInBl = _.find(newBlock.transactions, blockTx => 
          blockTx.trx && blockTx.trx.id === tx.transaction_id
        );
        if (txInBl) {
          clearInterval(intervalPid);
          const resultTx = txInBl;
          resultTx.block_num = lastBlock;
          res(txInBl);
        }
      }, 500);
    }),
    (async () => {
      const obj = await sendTransaction();
      tx = obj.tx;
    })()
  ]);
  return resTx[0];
};

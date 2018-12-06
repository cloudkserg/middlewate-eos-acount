/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers

const signatureProvider = (key) => new JsSignatureProvider([key]);
const rpc = (url) => new JsonRpc(url, { fetch });
const createJsApi = (api, key) => new Api({ 
  rpc: rpc(api.url), 
  signatureProvider: signatureProvider(key), 
  textDecoder: new TextDecoder(), 
  textEncoder: new TextEncoder() 
});


const sendTransactionTo =  async (api, accountFrom, accountTo, {value, symbol = 'EOS'}) => {
  const jsApi = createJsApi(api, accountFrom.key);

  const result = await jsApi.transact({
    actions: [{
      account: 'eosio.token',
      name: 'transfer',
      authorization: [{
        actor: accountFrom.address,
        permission: 'active',
      }],
      data: {
        from: accountFrom.address,
        to: accountTo.address,
        quantity: value + ' ' + symbol,
        memo: '',
      },
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 30,
  });
  return result; 
};

const isNeedBalance = async (api, address, sum) => {
  return (await api.getBalance(address, sum.symbol) > sum.value);
};

const sendTransaction = async (api, accounts, sum) => {
  if (await isNeedBalance(api, accounts[0].address, sum)) {
    const tx = await sendTransactionTo(api, accounts[0], accounts[1], sum);
    return {tx, from: accounts[0], to: accounts[1]};
  }
  const tx = await sendTransactionTo(api, accounts[1], accounts[0], sum);
  return {tx, from: accounts[1], to: accounts[0]};
};


module.exports = {
  sendTransaction,
  sendTransactionTo
};


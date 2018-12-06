/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const { Api, JsonRpc, JsSignatureProvider } = require('eosjs');
const fetch = require('node-fetch');                            // node only; not needed in browsers
const config = require('../config');
const { TextDecoder, TextEncoder } = require('text-encoding');  // node, IE11 and IE Edge Browsers

const signatureProvider = (key) => new JsSignatureProvider([key]);
const rpc = (url) => new JsonRpc(url, { fetch });
const createJsApi = (url, key) => new Api({ 
  rpc: rpc(url), 
  signatureProvider: signatureProvider(key), 
  textDecoder: new TextDecoder(), 
  textEncoder: new TextEncoder() 
});

module.exports =  async (accountTo, ownerKey, activeKey) => {
  const jsApi = createJsApi(config.eos.url, config.eos.mainKey);
  const result = await jsApi.transact({
    actions: [{
      account: 'eosio',
      name: 'newaccount',
      authorization: [{
        actor: config.eos.mainAccount,
        permission: 'active',
      }],
      data: {
        creator: config.eos.mainAccount,
        newact: accountTo,
        owner: {
          threshold: 1,
          keys: [{
            key: ownerKey,
            weight: 1
          }],
          accounts: [],
          waits: []
        },
        active: {
          threshold: 1,
          keys: [{
            key: activeKey,
            weight: 1
          }],
          accounts: [],
          waits: []
        },
      },
    },
    {
      account: 'eosio',
      name: 'buyrambytes',
      authorization: [{
        actor: config.eos.mainAccount,
        permission: 'active'
      }],
      data: {
        payer: config.eos.mainAccount,
        receiver: accountTo,
        bytes: 8192
      },
    },
    {
      account: 'eosio',
      name: 'delegatebw',
      authorization: [{
        actor: config.eos.mainAccount,
        permission: 'active'
      }],
      data: {
        from: config.eos.mainAccount,
        receiver: accountTo,
        stake_net_quantity: '1.0000 EOS',
        stake_cpu_quantity: '1.0000 EOS',
        transfer: false
      }
    }]
  }, {
    blocksBehind: 3,
    expireSeconds: 40,
  });
  return result; 
};

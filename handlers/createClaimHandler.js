/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'auth-service.createClaimHandler'}),
  claimRepo = require('../models/repo/claimRepo'),
  addressRepo = require('../models/repo/addressRepo'),
  ClaimResponse = require('../responses/ClaimResponse'),
  requests = require('../requests'),
  getAddress  = require('../utils/getAddress'),
  blockchainFabric = require('../blockchains/fabric'),
  getPriceInBlokchain = require('../utils/getPriceInBlokchain');  

/**
 * 
 * express handler of endpoint POST /claims
 * 
 * @param {Object} requestData
 * @param {String} requestData.body.blockchain -- name of blockchain for work with [eth|bitcoin]
 * @param {String} requestData.body.eosAddress - name of waiting eosAddress
 * @param {String} requestData.body.eosOwnerKey - name of waiting eosOWnerKey
 * @param {String} requestData.body.eosActiveKey - name of waiting eosActiveKey
 * @returns {{ok: String}} 
 */
module.exports = async (requestData, response) => {
  try {
    const userId = response.locals.data.userId || response.locals.data.clientId;
    const request = requests.createRequest(requestData); 

    const blockchain = blockchainFabric(request.blockchain);
    const address = await getAddress(blockchain);
    const price = await getPriceInBlokchain(blockchain);

    const claim = await claimRepo.create(
      blockchain.getName(), 
      request.eosAddress, 
      request.eosOwnerKey, 
      request.eosActiveKey, 
      address, price, userId
    );
    await addressRepo.setBusy(address);
   
    response.send({ok: true, claim: (new ClaimResponse(claim).data)});
  } catch (e) {
    log.error('throw error:' + e.toString());
    response.status(400);
    response.send('Failure in create claim request');
    throw e;
  }

  return response;
};

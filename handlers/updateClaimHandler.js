/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'auth-service.updateClaimHandler'}),
  models = require('../models'),
  constants = require('../config/constants'),
  claimRepo = require('../models/repo/claimRepo'),
  ClaimResponse = require('../responses/ClaimResponse'),
  requests = require('../requests');
/**
 * 
 * express handler of endpoint patch /claims/:id
 * 
 * @param {Object} requestData
 * @param {Number} requestData.params.id -- id of claim (only for userId)
 * @param {String} requestData.body.status -- new status of claim (paid|open)
 * @param {String} requestData.body.eosAddress - new name of eos account
 * @param {String} requestData.body.eosActiveKey - new activekey of eos account
 * @param {String} requestData.body.eosOwnerKey - new ownerkey of eos account
 * @returns {{ok: String}} 
 */
module.exports = async (generatorEosAccount, requestData, response) => {
  const getStatus = (claim, status) => {
    if (status === constants.statuses.open) {
      if (claim.status !== constants.statuses.timeout) 
        throw new Error('claim may transfer to open status only from timeout status');
      return constants.statuses.open;
    }

    if (status === constants.statuses.paid) {
      if (claim.status !== constants.statuses.notCreated) 
        throw new Error('claim may transfer to paid status only from not_created status');
      return constants.statuses.paid;
    }
  };

  try {
    const id = requestData.params.id;
    if (!id || typeof(id) === undefined || id === 'undefined')
      throw new Error('not send id for claims');
    const userId = response.locals.data.userId || response.locals.data.clientId;
    const request = requests.updateRequest(requestData);

    const claim = await models.claimModel.findOne({'_id': id, 'userId': userId});
    if (!claim)  
      throw new Error('Not find claim');

    const status = getStatus(claim, request.status);
    if (status === constants.statuses.open) {
      claim.startBlock = null;
      claim.endBlock = null;
    }
    await claimRepo.update(claim, request, status);

    if (status === constants.statuses.paid)
      generatorEosAccount.events.emit(generatorEosAccount.GENERATE, claim);
    
   
    response.send({ok: true, claim: (new ClaimResponse(claim).data)});
  } catch (e) {
    log.error('throw error:' + e.toString());
    response.status(400);
    response.send('Failure in update claim request');
    throw e;
  }

  return response;
};

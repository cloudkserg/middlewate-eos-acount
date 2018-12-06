/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const models = require('../models'),
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'eos-account.getClaimHandler'});
/**
 * 
 * express handler of endpoint /services
 * with data = {id, secret}
 * register service with this credo in db
 * 
 * @param {Object} requestData
 * @param {String} requestData.body.id -- id of client
 * @param {String} requestData.body.secret -- secret of client
 * @returns {{ok: String}} 
 */
const ClaimResponse = require('../responses/ClaimResponse');
module.exports = async (request, response) => {
  try {
    const id = request.params.id;
    const userId = response.locals.data.userId || response.locals.data.clientId;
    const claim = await models.claimModel.findOne({'_id': id, 'userId': userId});
    if (!claim) 
      throw new Error('Not find claim');
    response.send({ok: true, claim: (new ClaimResponse(claim)).data});
  } catch (e) {
    log.error('throw error:' + e.toString());
    response.status(400);
    response.send('Failure in get claim request');
  }

  return response;
};

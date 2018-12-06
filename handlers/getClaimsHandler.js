/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const models = require('../models'),
  bunyan = require('bunyan'),
  _ = require('lodash'),
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
    const filter = _.pick(request.params, [
      'address',
      'status',
      'result',
      'blockchain',
      'startBlock',
      'endBlock',
      'amount',
      'requiredAmount',
      'timestamp'
    ]);

    if (request.params.id) 
      filter['_id'] = request.params.id; 
    filter['userId'] = response.locals.data.userId || response.locals.data.clientId;
    const claims = await models.claimModel.find(filter);
    response.send({
      ok: true, 
      claims: _.map(
        claims, 
        claim => (new ClaimResponse(claim)).data
      )
    });
  } catch (e) {
    log.error('throw error:' + e.toString());
    response.status(400);
    response.send('Failure in get claims request');
  }

  return response;
};

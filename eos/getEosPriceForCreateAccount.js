const config = require('../config'),
  BigNumber = require('bignumber.js'),
  request = require('request-promise'),
  _ = require('lodash');
module.exports = async () => {
  const response = await request({
    uri: config.eos.url + '/v1/chain/get_table_rows',
    method: 'POST',
    body: {
      'scope': 'eosio',
      'code': 'eosio',
      'table': 'rammarket',
      'json': true
    },
    json: true
  });
  const row = _.get(response, ['rows'])[0];
  const price = parseFloat(
    _.get(row, 'quote.balance').substr(4)
  )/parseFloat(
    _.get(row, 'base.balance').substr(4)
  );
  return new BigNumber(price).times(4);
};


const config = require('../../config');
const Account = function (address, key) {
  return {address, key};
};
const accountFrom = process.env.ACCOUNT_FROM || '@';
const accountTo = process.env.ACCOUNT_TO || '@';
config.dev = {
  accounts: [
    new Account(...accountFrom.split('@')),
    new Account(...accountTo.split('@'))
  ]
};
module.exports = config;

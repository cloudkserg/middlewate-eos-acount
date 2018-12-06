const config = require('../config'),
  getEosPriceForCreateAccount = require('../eos/getEosPriceForCreateAccount'),
  providerFabric = require('../providers/fabric');

module.exports = async (blockchain) => {
  const eosPrice = await getEosPriceForCreateAccount();
  const priceInExchange = await providerFabric(config.exchange.provider)
    .getCurrencyEos(blockchain.getName(), eosPrice);
  const priceInExchangeDecimal = blockchain.getDecimalPrice(priceInExchange);
  const fee = await blockchain.getFee(priceInExchangeDecimal); 
  return priceInExchangeDecimal.plus(fee).toString();
};

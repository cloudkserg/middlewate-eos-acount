const constants = require('../config/constants'),
    _ = require('lodash'),
    config = require('../config'),
    BigNumber = require('bignumber.js'),
    request = require('request-promise');

class CoinMarketCap
{
    constructor() {
        this.url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';
        this.chains = {
            [`${constants.blockchains.ETH}`]: 'ETH',
            [`${constants.blockchains.NEM}`]: 'NEM',
            [`${constants.blockchains.BTC}`]: 'BTC',
            [`${constants.blockchains.DASH}`]: 'DASH',
            [`${constants.blockchains.WAVES}`]: 'WAVES',
        };
    }
    
    async getCurrencyEos (blockchainKey, amount) {
        const type = this.chains[blockchainKey];
        const requestOptions = {
        method: 'GET',
        uri: this.url,
        qs: {
            symbol: 'EOS',
            convert: type
        },
        headers: {
            'X-CMC_PRO_API_KEY': config.exchange.key
        },
        json: true,
        gzip: true
        };
        const response = await request(requestOptions);
        const price = _.get(response, `data.EOS.quote.${type}.price`);
        return new BigNumber(parseFloat(price)).times(amount);
    }

}

module.exports = CoinMarketCap;

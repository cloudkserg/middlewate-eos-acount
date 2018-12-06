const CoinMarketCap = require('./CoinMarketCap');
module.exports = (providerKey) => {
    const providers = {
        COINMARKETCAP: CoinMarketCap
    };
    if (!providers[providerKey]) 
        throw new Error('not found right providerKey ' + providerKey);
    return new (providers[providerKey]);
};

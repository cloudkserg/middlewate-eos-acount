const Eth = require('./blockchains/Eth'),
    getAddress = require('./utils/getAddress'),
    prepareDb = require('./utils/prepareDb');

const main = async (blockchain) => {
    await prepareDb();
    const address = await getAddress(blockchain);
    console.log(address);
}

const chain = new Eth();
main(chain);

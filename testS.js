const getPrivateKey  = require('./utils/signing/getPrivateKey');

const main =async () => {
    let r = await getPrivateKey('eth', 11);
    console.log('r1', r);
    r = await getPrivateKey('eth', 12);
    console.log('r2', r);
};

main();

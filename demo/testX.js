const request = require('request-promise'),
    authLib = require('middleware_auth_lib'),
    config = require('./tests/config');
const main = async () => {

    const response = await request({
        uri: 'http://167.99.91.77:8888/v1/history/get_transaction',
        method: 'POST',
        body: {
            id: '44d43daa278112bac9b53145376855e06c4f5648d6620eb9247a2defc8ce1bca'
        },
        json: true
    });
    console.log(response);
}

main();

const request = require('request-promise'),
    authLib = require('middleware_auth_lib'),
    config = require('./tests/config');
const main = async () => {
    const tokenLib = new authLib.Token({
        id: config.dev.id,
        provider: config.oauthService.url,
        secret: config.dev.secret,
    });
  const scopes = [config.id];
  const token = await tokenLib.getToken(scopes);

  console.log('getClaim 11')
  const id = process.argv[2];

    const response = await request({
        uri: 'http://localhost:8084/claims/' + id,
        method: 'GET',
        headers: {Authorization: 'Bearer ' + token},
        json: {
        }
    });
    console.log(response);
}

main();

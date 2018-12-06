const config = require('../../config'),
  request = require('request-promise'),
  authLib = require('middleware_auth_lib');
module.exports  = async (blockchainName, index = 1) => {
  const tokenLib = new authLib.Token({
    id: config.id,
    provider: config.oauthService.url,
    secret: config.secret,
  });

  const scopes = [config.signingsService.id];
  const token = await tokenLib.getToken(scopes);
  await request(`${config.signingsService.url}/keys`, {
    method: 'PUT',
    headers: {Authorization: 'Bearer ' + token},
    json: {
      address: config.signingsService.address,
      stageChild: 1,
      pubKeys: index
    }
  });

  const response = await request(`${config.signingsService.url}/keys`, {
    method: 'GET',
    headers: {Authorization: 'Bearer ' + token},
    json: true
  });
  return response[0]['pubKeys'][0][blockchainName];
};

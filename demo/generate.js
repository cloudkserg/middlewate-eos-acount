const config = require('./config'),
  request = require('request-promise'),
  Promise = require('bluebird'),
  authLib = require('middleware_auth_lib');
const generate  = async (blockchainName, index = 1) => {
  const tokenLib = new authLib.Token({
    id: config.id,
    provider: config.oauthService.url,
    secret: config.secret,
  });

  const scopes = [config.signingsService.id];
  const token = await tokenLib.getToken(scopes);

  // const response2 = await request(`${config.signingsService.url}/keys`, {
  //   method: 'DELETE',
  //   headers: {Authorization: 'Bearer ' + token},
  //   json: {
  //     'address': '0xd78962e703eecef6c8b61b6ce010d21b19363e66'
  //   }
  // });
  // console.log('delete', response2);

  const response1 = await request(`${config.signingsService.url}/keys`, {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + token},
    json: {
      'key': 'employ slice lounge game choose domain token sure palace beach lounge dream',
      'stageChild': true,
      'pubKeys': 10
    }
  });
  console.log(response1);
    return;
  const response = await request(`${config.signingsService.url}/keys`, {
    method: 'PUT',
    headers: {Authorization: 'Bearer ' + token},
    json: {
        'address': '0xd78962e703eecef6c8b61b6ce010d21b19363e66',
      'stage': true,
      'incrementChild':true,
      'pubKeys': 1
    }
  });
  console.log(response);
};

const main = async () => {
await generate('eth');
}

main();

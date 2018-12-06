# middleware-eos-account [![Build Status](https://travis-ci.org/ChronoBank/middleware-eos-account.svg?branch=master)](https://travis-ci.org/ChronoBank/middleware-eos-account)

Middleware service for create eos account

### Installation

This module is a part of middleware services. You can install it in 2 ways:

1) through core middleware installer  [middleware installer](https://github.com/ChronoBank/middleware)
2) by hands: just clone the repo, do 'npm install', set your .env - and you are ready to go


#### About
This module is used for create eos account.

User create claim for selected blockchain, than get address for send tokens,
than user send tokens in this address,
than middleware create eosAddress for selected address and keys.

All functionalite duplicate by rabbitmq events.


#### Statuses

What status may have claim?

open - status for open claim, that not have required amount, and not exceed limit in blocks
timeout - status for claim, that not have required amount, and exceed limit in blocks
paid - status for claim that have requried amount and ready for created eos account
creating - status for claim, that in process create eos account
created  - status for claim, that created eos account
not_created -status for claim, that not created eos account


#### RabbitMq events

AmountEvent
event when claim not exceed block limit time and have required amount
```
  claimId: claim._id,
  blockchain: claim.blockchain,
  address: claim.address,
  amount: claim.amount,
  requiredAmount: claim.requiredAmount,
  startBlock: claim.startBlock,
  endBlock: claim.endBlock
```

CreatedEvent

```
  claimId: claim._id,
  blockchain: claim.blockchain,
  address: claim.address,
  amount: claim.amount,
  requiredAmount: claim.requiredAmount,
  startBlock: claim.startBlock,
  endBlock: claim.endBlock
```

NotCreatedEvent
```
  claimId: claim._id,
  blockchain: claim.blockchain,
  address: claim.address,
  amount: claim.amount,
  requiredAmount: claim.requiredAmount,
  startBlock: claim.startBlock,
  endBlock: claim.endBlock
```

PaidEvent
event when claim exceed block limit time and have required amount
```
  claimId: claim._id,
  blockchain: claim.blockchain,
  address: claim.address,
  amount: claim.amount,
  requiredAmount: claim.requiredAmount,
  startBlock: claim.startBlock,
  endBlock: claim.endBlock
```

TimeoutEvent
event when claim exceed block limit time and not have required amount
```
  claimId: claim._id,
  blockchain: claim.blockchain,
  address: claim.address,
  amount: claim.amount,
  requiredAmount: claim.requiredAmount,
  startBlock: claim.startBlock,
  endBlock: claim.endBlock
```

#### API Methods

All calls api methods need make with oauth tokens.
For example
```
const tokenLib = new authLib.Token({
  id: config.dev.id,
  provider: config.oauthService.url,
  secret: config.dev.secret,
});
const scopes = [config.id];
const token = await tokenLib.getToken(scopes);

const response = await request({
  uri: 'http://localhost:8084/claims/' + id,
  method: 'GET',
  headers: {Authorization: 'Bearer ' + token},
  json: {
  }
});
```


##### Create claim
```
POST /claims

with body
blockchain - name of blockchain, which user use for send tokens
eosAddress - name of new created account
eosOwnerKey - public key of owners
eosActiveKey - public key of owners


const response = await request({
    uri: 'http://localhost:8084/claims',
    method: 'POST',
    headers: {Authorization: 'Bearer ' + token},
    json: {
        blockchain: 'eth',
        eosAddress: 'chronobank42',
        eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh',
        eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh'
    }
});

Response
{ ok: true,
  claim: { 
    id: '5bfe374c33105c7db125ab0d', //id of claim
    userId: 'test', //userId for it created claim
    address: '0x4b6ee108ee2f0c6d7cc3e05fd5f45c66ed4d9c2a', //name of address in blockchain, where user transfer tokens
    status: 'open', //status of claim
    eosAddress: 'chronobank42', //name of created account
    eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    blockchain: 'eth', //name of blockchain for use transfer tokens
    startBlock: 101, //startBlock of blockchain sync for this claim
    endBlock: 105, //endBlock of blockchain sync for this claim
    amount: '0', //current amount of tokens
    requiredAmount: '32135859613173', //required amount of tokens
    timestamp: 1543386956957  //when created
  } 
}

##### Get claims
```
GET /claims


const response = await request({
    uri: 'http://localhost:8084/claims?status=open',  //where :id - is id of claim,
    method: 'GET',
    headers: {Authorization: 'Bearer ' + token},
    json: {
    }
});

This request get all fields of claim for filter, for example status, userId or another

Response
{ ok: true,
  claims: [{ 
    id: '5bfe374c33105c7db125ab0d', //id of claim
    userId: 'test', //userId for it created claim
    address: '0x4b6ee108ee2f0c6d7cc3e05fd5f45c66ed4d9c2a', //name of address in blockchain, where user transfer tokens
    status: 'open', //status of claim
    eosAddress: 'chronobank42', //name of created account
    eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    blockchain: 'eth', //name of blockchain for use transfer tokens
    startBlock: 101, //startBlock of blockchain sync for this claim
    endBlock: 105, //endBlock of blockchain sync for this claim
    amount: '0', //current amount of tokens
    requiredAmount: '32135859613173', //required amount of tokens
    timestamp: 1543386956957  //when created
  }] 
}

##### Get claim
```
GET /claims/:id


const response = await request({
    uri: 'http://localhost:8084/claims/5bfe374c33105c7db125ab0d',  //where :id - is id of claim,
    method: 'GET',
    headers: {Authorization: 'Bearer ' + token},
    json: {
    }
});

Response
{ ok: true,
  claim: { 
    id: '5bfe374c33105c7db125ab0d', //id of claim
    userId: 'test', //userId for it created claim
    address: '0x4b6ee108ee2f0c6d7cc3e05fd5f45c66ed4d9c2a', //name of address in blockchain, where user transfer tokens
    status: 'open', //status of claim
    eosAddress: 'chronobank42', //name of created account
    eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    blockchain: 'eth', //name of blockchain for use transfer tokens
    startBlock: 101, //startBlock of blockchain sync for this claim
    endBlock: 105, //endBlock of blockchain sync for this claim
    amount: '0', //current amount of tokens
    requiredAmount: '32135859613173', //required amount of tokens
    timestamp: 1543386956957  //when created
  } 
}


##### Update claim
```
PATCH /claims/:id

with body (all fields is optional)
status - may be only two statuses - paid or open
eosAddress - name of new created account
eosOwnerKey - public key of owners
eosActiveKey - public key of owners

status open only change for claim with status=timeout
status paid only change for claim with status=not_created

eosData only change for claim with not status=creating or created


const response = await request({
    uri: 'http://localhost:8084/claims/5bfe374c33105c7db125ab0d',  //where :id - is id of claim,
    method: 'PATCH',
    headers: {Authorization: 'Bearer ' + token},
    json: {
        status: 'open',
        eosAddress: 'chronobank42',
        eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh',
        eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh'
    }
});

Response
{ ok: true,
  claim: { 
    id: '5bfe374c33105c7db125ab0d', //id of claim
    userId: 'test', //userId for it created claim
    address: '0x4b6ee108ee2f0c6d7cc3e05fd5f45c66ed4d9c2a', //name of address in blockchain, where user transfer tokens
    status: 'open', //status of claim
    eosAddress: 'chronobank42', //name of created account
    eosOwnerKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    eosActiveKey: 'EOS51EGMgroGcF5hC4pkeZjXKwNjjz3YyrnveFmRzjcDTRN4XdsRh', //public key for created account
    blockchain: 'eth', //name of blockchain for use transfer tokens
    startBlock: 101, //startBlock of blockchain sync for this claim
    endBlock: 105, //endBlock of blockchain sync for this claim
    amount: '0', //current amount of tokens
    requiredAmount: '32135859613173', //required amount of tokens
    timestamp: 1543386956957  //when created
  } 
}



##### сonfigure your .env

To apply your configuration, create a .env file in root folder of repo (in case it's not present already).
Below is the expamle configuration:

```
REST_PORT=8084
EOS_NODE=http://jungle2.cryptolions.io:80
EOS_ACCOUNT=chronobank21
EOS_KEY=5KXQPYAncmiPpM6Zwugw32423423424TthseRTpbMtZsfjWP1
SIGN_ADDRESS=0xd78962e703eecef6c8b61b6ce010d21b19363e66
```



The options are presented below:

| name | description|
| ------ | ------ |
| REST_PORT   | http port for work this middleware
| MONGO_URI   | the URI string for mongo connection
| MONGO_COLLECTION_PREFIX   | the default prefix for all mongo collections. The default value is 'tx_service'
| JWT_SECRET | the key -string for generate jwt tokens
| JWT_EXPIRES | the time, for which live tokens | default = 600c
| JWT_REFRESH_EXPIRES | the time, for which live tokens | default = 6000c
| SYSTEM_RABBIT_URI   | rabbitmq URI connection string for infrastructure
| SYSTEM_RABBIT_SERVICE_NAME   | rabbitmq service name for infrastructure
| SYSTEM_RABBIT_EXCHANGE   | rabbitmq exchange name for infrastructure
| CHECK_SYSTEM | check infrastructure or not (default = true)
| CHECK_WAIT_TIME | interval for wait respond from requirements
| SOCIAL_ALLOWED_SCOPES | allowed scopes for social tokens, though comma |default = middleware-signing-service
| NAME | name for client id in token sign with this service
| OAUTH_FILE | path of file from root with oauth.json for social networks


License
----
 [GNU AGPLv3](LICENSE)


Copyright
----
LaborX PTY

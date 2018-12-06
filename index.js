/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/

const config = require('./config'),
  ListenService=require('./services/ListenService'),
  GeneratorEosAccount = require('./services/GeneratorEosAccount'),
  prepareDb = require('./utils/prepareDb'),
  express = require('express'),
  authLib = require('middleware_auth_lib'),
  AmqpService = require('middleware_common_infrastructure/AmqpService'),
  InfrastructureInfo = require('middleware_common_infrastructure/InfrastructureInfo'),
  InfrastructureService = require('middleware_common_infrastructure/InfrastructureService'),
  bunyan = require('bunyan'),
  handlers = require('./handlers'),
  createChainCollection = require('./blockchains/createCollection'),
  PaidEvent = require('./events/PaidEvent'),
  Promise = require('bluebird'),
  amqp = require('amqplib'),
  log = bunyan.createLogger({name: 'auth-service'}),
  helmet = require('helmet');

const runSystem = async function () {
  const rabbit = new AmqpService(
    config.system.rabbit.url, 
    config.system.rabbit.exchange,
    config.system.rabbit.serviceName
  );
  const info = new InfrastructureInfo(require('./package.json'), config.system.waitTime);
  const system = new InfrastructureService(info, rabbit, {checkInterval: 10000});
  await system.start();
  system.on(system.REQUIREMENT_ERROR, (requirement, version) => {
    log.error(`Not found requirement with name ${requirement.name} version=${requirement.version}.` +
        ` Last version of this middleware=${version}`);
    process.exit(1);
  });
  await system.checkRequirements();
  system.periodicallyCheck();
};


const init = async () => {
  if (config.system.checkSystem)
    await runSystem();
    
  await prepareDb();

  let amqpInstance = await amqp.connect(config.rabbit.url);

  let channel = await amqpInstance.createChannel();

  channel.on('close', () => {
    throw new Error('rabbitmq process has finished!');
  });

  await channel.assertExchange('events', 'topic', {durable: false});

    

  const app = express();
  app.use(helmet());
  app.use(express.json());

  const auth = authLib.authMiddleware({
    serviceId: config.id,
    provider: config.oauthService.url
  });
  app.use(auth);
  app.post('/claims', handlers.createClaimHandler);
  app.get('/claims/:id', handlers.getClaimHandler);
  app.get('/claims', handlers.getClaimsHandler);


  const generatorEosAccount = new GeneratorEosAccount();
  await generatorEosAccount.start();
  generatorEosAccount.events.on(generatorEosAccount.EVENT, async (event, claim) => {
    console.log('LISTEN EOS', event, claim._id);
    await channel.publish(config.rabbit.exchange, 
      `${config.rabbit.serviceName}.claim.${claim._id}`, 
      new Buffer(JSON.stringify(event.data))
    );
  });

  app.patch('/claims/:id', handlers.updateClaimHandler.bind(null, generatorEosAccount));

  const chains = createChainCollection();
  await Promise.map(chains, async blockchain => {
    const listenService = new  ListenService(blockchain);
    await listenService.start();

    listenService.events.on(listenService.EVENT, async (event, claim) => {
      console.log('LISTEN', event, claim._id);
      if (event instanceof PaidEvent)
        generatorEosAccount.events.emit(generatorEosAccount.GENERATE, claim); 
      await channel.publish(config.rabbit.exchange, 
        `${config.rabbit.serviceName}.claim.${claim._id}`, 
        new Buffer(JSON.stringify(event.data))
      );
    });

    return listenService;
  });
  
  app.listen(config.http.port);
  log.info(`Eos creation service started at port ${config.http.port}`);
};

module.exports = init();

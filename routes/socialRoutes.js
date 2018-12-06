/** 
* Copyright 2017–2018, LaborX PTY
* Licensed under the AGPL Version 3 license.
* @author Kirill Sergeev <cloudkserg11@gmail.com>
*/
const config = require('../config'),
  _ = require('lodash'),
  userToken = require('../auth/lib/userToken'),
  passport = require('passport'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  bunyan = require('bunyan'),
  log = bunyan.createLogger({name: 'auth-service.socialRoutes'});

const createUid = (userId, network, purpose) => `${network}:${purpose}:${userId}`;
const createToken = async (socialNetwork, purpose, socialId) => {
  return await userToken.create(
    config.id,
    config.social.scopes,
    createUid(socialId, socialNetwork, purpose),
    {
      socialNetwork,
      purpose,
      socialId
    }
  );
};

function setupGoogleStrategy (name, strategy, { purpose, options }) {
  passport.use(
    name,
    new GoogleStrategy(
      options,
      async function (accessToken, refreshToken, profile, done) {
        try {
          const token = await createToken('google', purpose, profile.id);
          done(null, {token});
        } catch (e) {
          done(e);
        }
      }
    )
  );
}

function setupFacebookStrategy (name, strategy, { purpose, options }) {
  passport.use(
    name,
    new FacebookStrategy(
      options,
      async function (accessToken, refreshToken, profile, done) {
        try {
          const token = await createToken('facebook', purpose, profile.id);
          done(null, {token});
        } catch (e) {
          done(e);
        }
      }
    )
  );
}

module.exports = (app) => {
  if (_.has(config, 'social.oauth') && config.social.oauth) 
    for (const [name, {strategy, ...settings}] of Object.entries(config.social.oauth)) 
      switch (strategy) {
        case 'google':
          setupGoogleStrategy(name, strategy, settings);
          break;
        case 'facebook':
          setupFacebookStrategy(name, strategy, settings);
          break;
      }
    
  

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/oauth/:name', (req, res, next) => {
    try {
      const { name } = req.params;
      const { state } = req.query;
      if (!config.social.oauth[name]) 
        throw new Error('not set social ' + name + ' in config');
      
      const { scope } = config.social.oauth[name];
      const authenticate = passport.authenticate(name, { scope, state });
      return authenticate(req, res, next);
    } catch (e) {
      log.error('throw error:' + e.toString());
      res.status(400);
      res.send('Failure in social request');
    }
  });

  app.get('/oauth/:name/callback', (req, res) => {
    const { name } = req.params;
    const { state } = req.query;
    if (!config.social.oauth[name]) 
      throw new Error('not set social ' + name + ' in config');
    
    const { strategy, purpose, routes } = config.social.oauth[name];
    const authenticate = passport.authenticate(name, { session: false, failureRedirect: routes.failureRedirect });
    return authenticate(req, res, async () => {
      try {
        res
          .cookie('Token', req.user.token, { expires: 0, secure: true, sameSite: false })
          .cookie('Authenticator', `oauth-${strategy}`, { expires: 0, secure: true, sameSite: false })
          .redirect(
            state
              ? (routes.successRedirect + `?state=${state}`)
              : routes.successRedirect
          );
      } catch (e) {
        res
          .clearCookie('Token')
          .clearCookie('Authenticator')
          .redirect(
            state
              ? (routes.failureRedirect + `?state=${state}`)
              : routes.failureRedirect
          );
      }
    });
  });


  app.get('/server', (req, res) => {
    res.send('all ok'); 
  });
};

/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const validate = require('../utils/validate'),
  Joi = require('joi');

const schema = Joi.object().keys({
  blockchain: Joi.string().required(),
  eosAddress: Joi.string().required(),
  eosOwnerKey: Joi.string().required(),
  eosActiveKey: Joi.string().required() 
});

module.exports = (data) => {
  return validate(data, schema);
};

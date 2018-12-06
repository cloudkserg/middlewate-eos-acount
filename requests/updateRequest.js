/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const validate = require('../utils/validate'),
  Joi = require('joi');

const schema = Joi.object().keys({
  status: Joi.string(),
  eosAddress: Joi.string(),
  eosOwnerKey: Joi.string(),
  eosActiveKey: Joi.string()
});

module.exports = (data) => {
  return validate(data, schema);
};

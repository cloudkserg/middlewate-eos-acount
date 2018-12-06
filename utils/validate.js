/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Kirill Sergeev <cloudkserg11@gmail.com>
 */
const Joi = require('joi'),
  errors = require('../errors');
/**
 * 
 * @param {Object} data 
 * @param {Object} schema 
 * @param {Object} options 
 */
module.exports = (data, schema, options = {}) => {
  const { error, value } = Joi.validate(
    data.body,
    schema,
    options
  );
  if (error) 
    throw new errors.ValidateError(`Validation error: ${error.toString()}`);
  return value;
};

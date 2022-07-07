const Joi = require('joi');

const registrationSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  name: Joi.string().lowercase().trim().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const eventsSchema = Joi.object({
  title: Joi.string().required(),
  date: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  description: Joi.string(),
});

module.exports = { registrationSchema, loginSchema, eventsSchema, changePasswordSchema };

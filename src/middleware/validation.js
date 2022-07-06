const {
  registrationSchema,
  loginSchema,
  eventsSchema,
} = require('../models/auth');

const validation = async (req, res, next, schema) => {
  try {
    req.body = await schema.validateAsync(req.body);
    return next();
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent' });
  }
};

module.exports = {
  registrationValidation: (req, res, next) =>
    validation(req, res, next, registrationSchema),
  loginValidation: (req, res, next) => validation(req, res, next, loginSchema),
  eventsValidation: (req, res, next) =>
    validation(req, res, next, eventsSchema),
};

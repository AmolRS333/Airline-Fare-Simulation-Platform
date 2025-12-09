const Joi = require('joi');

const validateEmail = (email) => {
  const schema = Joi.string().email().required();
  return schema.validate(email);
};

const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().optional(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const validateFlightSearch = (data) => {
  const schema = Joi.object({
    origin: Joi.string().required(),
    destination: Joi.string().required(),
    departureDate: Joi.date().required(),
    returnDate: Joi.date().optional(),
  });
  return schema.validate(data);
};

const validateBookingPassengers = (data) => {
  const schema = Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      dateOfBirth: Joi.date().required(),
      passport: Joi.string().optional(),
      nationality: Joi.string().optional(),
    })
  );
  return schema.validate(data);
};

module.exports = {
  validateEmail,
  validateRegister,
  validateLogin,
  validateFlightSearch,
  validateBookingPassengers,
};

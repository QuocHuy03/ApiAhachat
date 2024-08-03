const Joi = require("joi");

const validationSchemas = {
  6: Joi.object({
    reply: Joi.string()
      .pattern(/^\d{10}$/)
      .required(),
  }),
  3: Joi.object({
    reply: Joi.string()
      .regex(/^\d+\s*(t|tr|m|trieu|triệu| triệu)?\s*\d*$/i)
      .required(),
  }),
};

module.exports = validationSchemas;

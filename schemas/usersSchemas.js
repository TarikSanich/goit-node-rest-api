import Joi from "joi";


export const registerUserSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).required(),
});
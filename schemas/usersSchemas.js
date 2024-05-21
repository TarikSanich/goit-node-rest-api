import Joi from "joi";

// Schema for validating POST /users/register

export const registerUserSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).required(),
});
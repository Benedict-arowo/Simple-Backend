import Joi from "joi";

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
});

export const registrationSchema = Joi.object({
	full_name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().required(),
	age: Joi.number().required(),
	dob: Joi.date().required(),
	reason: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
	oldPassword: Joi.string().required(),
	newPassword: Joi.string().required(),
});

export const verifyUserSchema = Joi.object({
	email: Joi.string().email().required(),
	code: Joi.string().required(),
});

export const forgetPasswordSchema = Joi.object({
	newPassword: Joi.string().required(),
	email: Joi.string().email().required(),
	code: Joi.string().required(),
});

export const initforgetPasswordSchema = Joi.object({
	email: Joi.string().email().required(),
});

export const resendVerificationCodeSchema = Joi.object({
	email: Joi.string().email().required(),
});

export const deleteAccountSchema = Joi.object({
	password: Joi.string().required(),
});

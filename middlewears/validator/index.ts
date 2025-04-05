import Joi from "joi";
import { ValidationError } from "../error";

const validator = (data: any, schema: Joi.ObjectSchema<any>) => {
	const { error } = schema.validate(data, { abortEarly: false });

	if (error) {
		const formattedErrors = error.details.map((detail: any) => ({
			field: detail.path.join("."),
			message: detail.message.replace(/['"]/g, ""),
		}));

		throw new ValidationError(formattedErrors);
	}
	return 0;
};

export default validator;

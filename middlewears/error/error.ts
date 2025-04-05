import ErrorParent, { ValidationError } from "./";
import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import CONFIG from "../../utils/config";

const ErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (err instanceof ValidationError) {
		res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
			errors: err.errors,
		});
		return;
	}

	if (err instanceof ErrorParent) {
		res.status(err.code).json({
			message: err.message,
			stack: CONFIG.env.NODE_ENV === "development" ? err.stack : null,
		});
		return;
	} else {
		res.status(500).json({
			message: err.message,
			stack: CONFIG.env.NODE_ENV === "development" ? err.stack : null,
		});
		return;
	}
};

export default ErrorHandler;

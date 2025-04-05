import { Response, NextFunction } from "express";
import CONFIG from "../utils/config";
import ErrorParent, { UnauthorizedError } from "./error";
import { Req } from "../utils/types";
import AuthService from "../services/auth.service";

const authService = new AuthService();

const authenticated = (req: Req, res: Response, next: NextFunction) => {
	try {
		const access_token = req.cookies?.[CONFIG.env.ACCESS_TOKEN];

		if (!access_token) {
			return next(
				new UnauthorizedError("Unauthorized - No access token")
			);
		}

		const userData = authService.verifyToken(access_token, "ACCESS");

		if (!userData) {
			return next(
				new UnauthorizedError("Unauthorized - Invalid or expired token")
			);
		}

		req["user"] = userData;

		next();
	} catch (error) {
		if (error instanceof ErrorParent) {
			throw new ErrorParent(error.message, error.code);
		}
		return next(
			new UnauthorizedError("Unauthorized - Token verification failed")
		);
	}
};

export default authenticated;

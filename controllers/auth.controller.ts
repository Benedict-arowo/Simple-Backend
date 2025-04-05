import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import CONFIG from "../utils/config";
import AuthService from "../services/auth.service";
import validate from "../middlewears/validator/index";
import {
	changePasswordSchema,
	deleteAccountSchema,
	forgetPasswordSchema,
	initforgetPasswordSchema,
	loginSchema,
	registrationSchema,
	resendVerificationCodeSchema,
	verifyUserSchema,
} from "../middlewears/validator/auth.validator";
import { Req } from "../utils/types";

class AuthController {
	private service: AuthService;

	constructor() {
		this.service = new AuthService();
	}

	public register = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		validate(req.body, registrationSchema);
		await this.service.createUser(req.body);
		return res.status(StatusCodes.CREATED).json({ success: true });
	};

	public login = async (req: Request, res: Response): Promise<Response> => {
		validate(req.body, loginSchema);
		const { tokens, user } = await this.service.loginUser(req.body);

		res.cookie(CONFIG.env.ACCESS_TOKEN, tokens[CONFIG.env.ACCESS_TOKEN], {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			expires: new Date(
				Date.now() + CONFIG.env.ACCESS_TOKEN_EXPIRATION * 60 * 1000
			),
		});

		res.cookie(CONFIG.env.REFRESH_TOKEN, tokens[CONFIG.env.REFRESH_TOKEN], {
			httpOnly: true,
			sameSite: "none",
			secure: true,
			expires: new Date(
				Date.now() + CONFIG.env.REFRESH_TOKEN_EXPIRATION * 60 * 1000
			),
		});

		return res
			.status(StatusCodes.OK)
			.json({ success: true, data: { user } });
	};

	public changePassword = async (
		req: Req,
		res: Response
	): Promise<Response> => {
		validate(req.body, changePasswordSchema);
		const { email } = req.user;
		await this.service.changePassword({
			userEmail: email,
			...req.body,
		});
		return res.status(StatusCodes.OK).json({ success: true });
	};

	public initForgetPassword = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		validate(req.body, initforgetPasswordSchema);
		const { email } = req.body;
		await this.service.initForgetPassword(email);
		return res.status(StatusCodes.OK).json({ success: true });
	};

	public resendVerificationCode = async (
		req: Req,
		res: Response
	): Promise<Response> => {
		validate(req.body, resendVerificationCodeSchema);
		const { email } = req.body;
		await this.service.resendVerificationCode(email);
		return res.status(StatusCodes.OK).json({ success: true });
	};

	public verifyUser = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		validate(req.body, verifyUserSchema);
		const { code, email } = req.body;
		await this.service.verifyUser({ code, email });
		return res.status(StatusCodes.OK).json({ success: true });
	};

	public forgetPassword = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		validate(req.body, forgetPasswordSchema);
		await this.service.forgetPassword(req.body);
		return res.status(StatusCodes.OK).json({ success: true });
	};

	public deleteAccount = async (
		req: Req,
		res: Response
	): Promise<Response> => {
		validate(req.body, deleteAccountSchema);
		const { password } = req.body;
		const { userId: id } = req.user;
		await this.service.deleteAccount(id, password);

		res.clearCookie(CONFIG.env.ACCESS_TOKEN);
		res.clearCookie(CONFIG.env.REFRESH_TOKEN);

		return res.status(StatusCodes.NO_CONTENT).json();
	};

	public logout = async (req: Req, res: Response): Promise<Response> => {
		res.clearCookie(CONFIG.env.ACCESS_TOKEN);
		res.clearCookie(CONFIG.env.REFRESH_TOKEN);

		return res.status(StatusCodes.NO_CONTENT).json();
	};

	public refreshAccessToken = async (
		req: Request,
		res: Response
	): Promise<Response> => {
		try {
			const refreshToken = req.cookies[CONFIG.env.REFRESH_TOKEN];
			if (!refreshToken) {
				return res
					.status(StatusCodes.UNAUTHORIZED)
					.json({ message: "Refresh token is missing" });
			}

			// Call the service to refresh the tokens
			const { accessToken, refreshToken: newRefreshToken } =
				await this.service.refreshTokens(refreshToken);

			// Set the new refresh token in cookies
			res.cookie(CONFIG.env.REFRESH_TOKEN, newRefreshToken, {
				httpOnly: true,
				sameSite: "none",
				secure: true,
				expires: new Date(
					Date.now() + CONFIG.env.REFRESH_TOKEN_EXPIRATION * 60 * 1000
				),
			});

			// Return the new access token
			return res.status(StatusCodes.OK).json({ accessToken });
		} catch (error) {
			console.error(error);
			return res
				.status(StatusCodes.INTERNAL_SERVER_ERROR)
				.json({ message: "Internal Server Error" });
		}
	};
}

export default AuthController;

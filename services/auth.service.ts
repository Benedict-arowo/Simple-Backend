import Users from "../models/Users";
import argon from "argon2";
import crypto from "crypto";
import {
	BadrequestError,
	UnauthorizedError,
	NotFoundError,
} from "../middlewears/error";
import CONFIG from "../utils/config";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendVerificationCode } from "./emails";

class AuthService {
	public createUser = async ({
		full_name,
		email,
		password,
		dob,
		reason,
		age,
	}: {
		full_name: string;
		email: string;
		password: string;
		dob: Date;
		reason: string;
		age: Number;
	}) => {
		try {
			const existingUser = await Users.findOne({ email });
			if (existingUser) {
				throw new BadrequestError("User already exists");
			}

			const hashedPassword = await argon.hash(password);

			const userData = new Users({
				name: full_name,
				email,
				password: hashedPassword,
				dob: new Date(dob),
				reason,
				age,
			});

			await userData.save();
			console.log("User created:", userData);

			await this.generateOtp(email);

			return { user: userData, otpSent: true };
		} catch (error) {
			console.error("Error creating user:", error);
			throw error;
		}
	};

	public loginUser = async ({
		email,
		password,
	}: {
		email: string;
		password: string;
	}) => {
		try {
			const user = await Users.findOne({ email });
			if (!user) {
				throw new NotFoundError("User not found");
			}

			const isPasswordValid = await argon.verify(user.password, password);
			if (!isPasswordValid) {
				throw new UnauthorizedError("Invalid credentials");
			}

			if (!user.email_verified) {
				throw new UnauthorizedError("Email not verified");
			}

			const tokens = this.generateTokens(user, "both");

			console.log("User logged in:", email);
			return {
				tokens,
				user,
			};
		} catch (error) {
			console.error("Error logging in:", error);
			throw error;
		}
	};

	public changePassword = async ({
		userEmail,
		oldPassword,
		newPassword,
	}: {
		userEmail: string;
		oldPassword: string;
		newPassword: string;
	}) => {
		console.log(userEmail);
		try {
			const user = await Users.findOne({ email: userEmail });
			if (!user) {
				throw new NotFoundError("User not found");
			}

			if (!user.email_verified) {
				throw new UnauthorizedError("Email not verified");
			}

			const isPasswordValid = await argon.verify(
				user.password,
				oldPassword
			);

			if (!isPasswordValid) {
				throw new UnauthorizedError("Old password is incorrect");
			}

			const hashedNewPassword = await argon.hash(newPassword);

			user.password = hashedNewPassword;
			await user.save();

			console.log("Password changed for:", userEmail);
		} catch (error) {
			console.error("Error changing password:", error);
			throw error;
		}
	};

	public initForgetPassword = async (email: string) => {
		try {
			const user = await Users.findOne({ email });
			if (!user) {
				throw new NotFoundError("User not found");
			}

			await sendPasswordResetEmail(user);
			console.log("Password reset initiated for:", email);
		} catch (error) {
			console.error("Error initiating password reset:", error);
			throw error;
		}
	};

	public resendVerificationCode = async (email: string) => {
		try {
			const user = await Users.findOne({ email });
			if (!user) {
				throw new NotFoundError("User not found");
			}

			if (user.email_verified) {
				throw new BadrequestError("User already verified");
			}

			await this.generateOtp(user.email);
			console.log("Verification code resent for:", email);
		} catch (error) {
			console.error("Error resending verification code:", error);
			throw error;
		}
	};

	public verifyUser = async ({
		code,
		email,
	}: {
		code: string;
		email: string;
	}) => {
		try {
			const user = await Users.findOne({ email });
			if (!user) {
				throw new NotFoundError("User not found");
			}

			if (user.email_verified) {
				throw new BadrequestError("User already verified");
			}

			if (user.otp !== code) {
				throw new UnauthorizedError("Invalid OTP code");
			}

			if (new Date() > new Date(user.otp_expiry)) {
				throw new UnauthorizedError("OTP has expired");
			}

			user.email_verified = true;
			user.otp = undefined;
			user.otp_expiry = undefined;

			await user.save();

			console.log("User verified:", email);
			return { success: true, message: "User verified successfully" };
		} catch (error) {
			console.error("Error verifying user:", error);
			throw error;
		}
	};

	public forgetPassword = async ({
		email,
		code,
		newPassword,
	}: {
		email: string;
		code: string;
		newPassword: string;
	}) => {
		try {
			const user = await Users.findOne({ email });

			if (!user) {
				throw new NotFoundError("User not found");
			}

			if (user.otp !== code) {
				throw new UnauthorizedError("Invalid OTP code");
			}

			const hashedNewPassword = await argon.hash(newPassword);

			user.password = hashedNewPassword;
			user.otp = undefined;
			user.otp_expiry = undefined;
			await user.save();

			console.log("Password reset successfully for:", user.email);
		} catch (error) {
			console.error("Error resetting password:", error);
			throw error;
		}
	};

	public deleteAccount = async (id: string, password: string) => {
		try {
			const user = await Users.findById(id);

			if (!user) {
				throw new NotFoundError("User not found");
			}

			const isPasswordValid = await argon.verify(user.password, password);
			if (!isPasswordValid) {
				throw new UnauthorizedError("Invalid password");
			}

			await Users.deleteOne({ _id: id });
			console.log("Account deleted for:", user.email);
		} catch (error) {
			console.error("Error deleting account:", error);
			throw error;
		}
	};

	private generateOtp = async (email: string) => {
		const otp = crypto.randomBytes(3).toString("hex"); // 6-digit OTP
		const otpExpiry = new Date(
			Date.now() + CONFIG.env.OTP_EXPIRATION * 60 * 1000
		);

		const user = await Users.findOne({ email });
		if (user) {
			user.otp = otp;
			user.otp_expiry = otpExpiry;
			await user.save();
		}

		await sendVerificationCode(user);

		return otp;
	};

	public verifyToken = (token: string, tokenType: "ACCESS" | "REFRESH") => {
		try {
			const secretKey =
				tokenType === "ACCESS"
					? CONFIG.env.ACCESS_TOKEN_SECRET
					: CONFIG.env.REFRESH_TOKEN_SECRET;

			const decoded = jwt.verify(token, secretKey) as { email: string };

			return decoded;
		} catch (error) {
			throw new UnauthorizedError("Invalid or expired token");
		}
	};

	public generateTokens = (
		user: { id: string; email: string },
		tokenType: "access" | "refresh" | "both" = "both"
	) => {
		try {
			const payload = { userId: user.id, email: user.email };

			let tokens: {
				[CONFIG.env.ACCESS_TOKEN]?: string;
				[CONFIG.env.REFRESH_TOKEN]?: string;
			} = {};

			if (tokenType === "access" || tokenType === "both") {
				tokens[CONFIG.env.ACCESS_TOKEN] = jwt.sign(
					payload,
					CONFIG.env.ACCESS_TOKEN_SECRET,
					{
						expiresIn: CONFIG.env.ACCESS_TOKEN_EXPIRATION,
					}
				);
			}

			if (tokenType === "refresh" || tokenType === "both") {
				tokens[CONFIG.env.REFRESH_TOKEN] = jwt.sign(
					payload,
					CONFIG.env.REFRESH_TOKEN_SECRET,
					{
						expiresIn: CONFIG.env.REFRESH_TOKEN_EXPIRATION,
					}
				);
			}

			return tokens;
		} catch (error) {
			console.error("Error generating tokens:", error);
			throw new Error("Token generation failed");
		}
	};

	public refreshTokens = async (
		refreshToken: string
	): Promise<{ accessToken: string; refreshToken: string }> => {
		return new Promise((resolve, reject) => {
			jwt.verify(
				refreshToken,
				CONFIG.env.REFRESH_TOKEN_SECRET,
				(err, decoded) => {
					if (err) {
						return reject(new Error("Invalid refresh token"));
					}

					const userId = (decoded as any).userId;

					const newAccessToken = jwt.sign(
						{ userId },
						CONFIG.env.ACCESS_TOKEN_SECRET,
						{
							expiresIn: CONFIG.env.ACCESS_TOKEN_EXPIRATION,
						}
					);

					const newRefreshToken = jwt.sign(
						{ userId },
						CONFIG.env.REFRESH_TOKEN_SECRET,
						{
							expiresIn: CONFIG.env.REFRESH_TOKEN_EXPIRATION,
						}
					);

					resolve({
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					});
				}
			);
		});
	};
}

export default AuthService;

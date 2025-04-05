import nodemailer from "nodemailer";
import CONFIG from "../utils/config";

const transporter = nodemailer.createTransport({
	host: CONFIG.env.MAIL_HOST,
	port: CONFIG.env.MAIL_PORT,
	secure: CONFIG.env.MAIL_SECURE,
	auth: {
		user: CONFIG.env.MAIL_AUTH_USERNAME,
		pass: CONFIG.env.MAIL_AUTH_PASSWORD,
	},
});

// Function to send an email
const sendEmail = async (
	to: string,
	subject: string,
	text: string,
	html: string
) => {
	try {
		const mailOptions = {
			from: CONFIG.env.MAIL_AUTH_USERNAME,
			to,
			subject,
			text,
			html,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.response);
	} catch (error) {
		console.error("Error sending email:", error);
		throw new Error("Email sending failed");
	}
};

const sendPasswordResetEmail = async (user: { email: string; otp: string }) => {
	const resetLink = `${CONFIG.env.ROUTE_PREFIX}/auth/reset-password?otp=${user.otp}&email=${user.email}`;
	const subject = "Password Reset Request";
	const text = `Hi, \n\nYou requested to reset your password. Please use the following OTP: ${user.otp}. You can reset your password by clicking on the link below: \n\n${resetLink}`;
	const html = `<p>Hi,</p><p>You requested to reset your password. Please use the following OTP: <strong>${user.otp}</strong>. You can reset your password by clicking on the link below:</p><p><a href="${resetLink}">${resetLink}</a></p>`;

	await sendEmail(user.email, subject, text, html);
};

const sendVerificationCode = async (user: { email: string; otp: string }) => {
	const verificationLink = `${CONFIG.env.ROUTE_PREFIX}/auth/verify-email?otp=${user.otp}&email=${user.email}`;
	const subject = "Email Verification Code";
	const text = `Hi, \n\nPlease use the following OTP to verify your email: ${user.otp}. You can verify your email by clicking on the link below: \n\n${verificationLink}`;
	const html = `<p>Hi,</p><p>Please use the following OTP to verify your email: <strong>${user.otp}</strong>. You can verify your email by clicking on the link below:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`;

	await sendEmail(user.email, subject, text, html);
};

export { sendPasswordResetEmail, sendVerificationCode };

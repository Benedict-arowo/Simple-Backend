require("dotenv").config({
	path: ".env",
});

import { cleanEnv, str, port, bool, num } from "envalid";

const env = cleanEnv(process.env, {
	NODE_ENV: str({ choices: ["development", "production", "test"] }),
	PORT: port({ default: 8000 }),
	DATABASE_URL: str(),
	DEBUG_MODE: bool({ default: false }),
	ROUTE_PREFIX: str({ default: "/api" }),
	MAIL_SERVICE: str(),
	MAIL_HOST: str(),
	MAIL_PORT: port(),
	MAIL_SECURE: bool(),
	MAIL_AUTH_USERNAME: str(),
	MAIL_AUTH_PASSWORD: str(),
	OTP_EXPIRATION: num({ default: 5 }), // In minutes
	// PASSWORD_CODE_EXPIRATION: num({ default: 5 }), // In minutes
	SEND_EMAILS: bool({ default: true, devDefault: true }),
	ACCESS_TOKEN: str({ default: "ace_token" }),
	REFRESH_TOKEN: str({ default: "refr_token" }),
	ACCESS_TOKEN_EXPIRATION: num({ default: 60 * 24 * 7 }), // 7 days In minutes
	REFRESH_TOKEN_EXPIRATION: num({ default: 60 * 24 * 30 }), // 30 days In minutes
	REFRESH_TOKEN_SECRET: str({}),
	ACCESS_TOKEN_SECRET: str({}),
});

const CONFIG = {
	env,
};

export default CONFIG;

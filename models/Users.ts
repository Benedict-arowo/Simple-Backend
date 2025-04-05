const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
		},
		password: {
			type: String,
			required: true,
		},
		score: {
			type: Number,
			default: 0,
		},
		otp: {
			type: String,
			// Having different types of otp? For email verification and password reset
		},
		total_test_taken: {
			type: Number,
			default: 0,
		},
		current_track: {
			type: String,
			default: "CSS",
		},
		email_verified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model("User", userSchema);

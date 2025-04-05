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
		age: {
			type: Number,
			required: true,
		},
		dob: {
			type: Date,
			required: true,
		},
		reason: {
			type: String,
			required: true,
		},
		score: {
			type: Number,
			default: 0,
		},
		otp: {
			type: String,
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

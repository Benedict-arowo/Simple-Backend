import mongoose from "mongoose";
import CONFIG from "../utils/config";

function connectToDB() {
	mongoose.connect(CONFIG.env.DATABASE_URL);

	mongoose.connection.on("connected", () => {
		console.log("DB connected Successfully!");
	});

	mongoose.connection.on("error", (err) => {
		console.log("DB connection failed!", err);
	});
}

export default connectToDB;

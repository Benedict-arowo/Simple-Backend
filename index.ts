import CONFIG from "./utils/config";
import Routes from "./routes";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDB from "./models/index";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);
Routes(app);

connectToDB();

app.listen(CONFIG.env.PORT, () => {
	console.log(`Listening on ${CONFIG.env.PORT}`);
});

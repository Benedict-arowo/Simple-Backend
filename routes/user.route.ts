import express from "express";
import Wrapper from "../middlewears/wrapper";
import authenticatedOnly from "../middlewears/authenticated";
import UserController from "../controllers/user.controller";

const router = express.Router();

router.get("/info", authenticatedOnly, Wrapper(UserController.getUserInfo));
router.get(
	"/leaderboard",

	Wrapper(UserController.getLeaderboard)
);

export default {
	routeUrl: "user",
	Router: router,
};

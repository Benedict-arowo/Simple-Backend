import { Request, Response } from "express";
import { Req } from "../utils/types";
import Users from "../models/Users";

class UserController {
	static async getUserInfo(req: Req, res: Response): Promise<Response> {
		try {
			const user = req.user;
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			const fetchedUser = await Users.findById(user._id).select(
				"-password"
			);

			return res.status(200).json(fetchedUser);
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Server error" });
		}
	}

	static async getLeaderboard(
		req: Request,
		res: Response
	): Promise<Response> {
		try {
			const { page = "1", limit = "10" } = req.query;
			const pageNum = parseInt(page as string, 10);
			const limitNum = parseInt(limit as string, 10);

			if (isNaN(pageNum) || isNaN(limitNum)) {
				return res
					.status(400)
					.json({ message: "Invalid pagination parameters" });
			}

			const skip = (pageNum - 1) * limitNum;
			const leaderboard = await Users.find()
				.select("-password")
				.sort({ points: -1 })
				.skip(skip)
				.limit(limitNum);
			const total = await Users.countDocuments();

			return res.status(200).json({
				leaderboard,
				pagination: {
					total,
					page: pageNum,
					limit: limitNum,
					totalPages: Math.ceil(total / limitNum),
				},
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Server error" });
		}
	}
}

export default UserController;

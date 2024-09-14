import UserModel from "../../models/UserModel.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const config = process.env;

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email) {
			return res.status(401).send({
				message: "Invalid request",
			});
		}

		const user = await UserModel.findOne({
			where: { email: email },
			attributes: {
				exclude: ["salt"],
			},
		});
		console.log(user);
		if (!user) {
			return res.status(404).json({
				error: "User does not exist",
				ok: false,
				status: 404,
			});
		}

		const passwordMatch = await bcryptjs.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jsonwebtoken.sign(
			{ user: { email: user.email, username: user.username } },
			config.TOKEN,
			{
				expiresIn: 86400,
			},
		);

		res.cookie(
			"advanced-state-management-user",
			{
				id: user.id,
				username: user.username,
				email: user.email,
				token: token,
			},
			{
				httpOnly: true,
				signed: true,
				secure: true,
				maxAge: 60 * 60 * 24 * 1000,
			},
		);

		return res.status(200).json({
			token: token,
			username: user.username,
			userId: user.id,
			role: user.role,
			status: 200,
			ok: true,
		});
	} catch (err) {
		return res.status(500).json({
			error: "Internal server err???or",
			reason: err,
		});
	}
};

export default login;

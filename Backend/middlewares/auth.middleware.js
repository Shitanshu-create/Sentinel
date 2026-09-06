import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";
import env from "../config/env.js";
import crypto from "crypto";


async function authUser(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json(
                { message: "Please log in to continue" }
            );
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token: tokenHash });

        if (isTokenBlacklisted) {
            return res.status(401).json(
                { message: "Session expired. Please log in again" }
            );
        }

        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();

    } catch (err) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
            return res.status(401).json(
                { message: "Session expired. Please log in again" }
            );
        }

        next(err);
    }

}

export default {authUser};

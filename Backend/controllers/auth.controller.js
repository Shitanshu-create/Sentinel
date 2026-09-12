import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import tokenBlacklistModel from "../models/blacklist.model.js";
import env from "../config/env.js";
import crypto from "crypto";

const authCookieOptions = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: env.cookie.maxAge
};

/**
 * @name registerUserController
 * @description register a new user
 * @access Public
 */
async function registerUserController(req, res, next) {
    try {
        const { personalDetails, serviceDetails, currentStatus, loginCredentials, username: flatUsername, email: flatEmail, password: flatPassword } = req.body;

        const username = loginCredentials?.username || flatUsername;
        const email = personalDetails?.email || flatEmail;
        const password = loginCredentials?.password || flatPassword;

        if (!username || !email || !password) {
            return res.status(400).json(
                { message: "Username, email, and password are required" }
            );
        }

        const userAlreadyExists = await UserModel.findOne({
            $or: [{ username }, { email }]
        });

        if (userAlreadyExists) {
            const message = userAlreadyExists.email === email
                ? "Email is already registered"
                : "Username is already taken";

            return res.status(400).json(
                { message }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new UserModel({
            username,
            email,
            passwordHash,
            role: req.body.role || "personnel",
            personalDetails: personalDetails ? {
                name: personalDetails.name || username,
                age: personalDetails.age ? Number(personalDetails.age) : undefined,
                gender: personalDetails.gender,
                phoneNo: personalDetails.phoneNo
            } : { name: username },
            serviceDetails: serviceDetails || {},
            currentStatus: currentStatus ? {
                ...currentStatus,
                estimatedWorkHours: currentStatus.estimatedWorkHours ? Number(currentStatus.estimatedWorkHours) : undefined,
                lastLeaveDate: currentStatus.lastLeaveDate ? new Date(currentStatus.lastLeaveDate) : undefined
            } : {}
        });

        const token = jwt.sign(
            {
                Id: newUser._id,
                username: newUser.username,
                role: newUser.role
            },
            env.jwtSecret,
            { expiresIn: "1d" }
        );

        await newUser.save();

        res.cookie("token", token, authCookieOptions);

        res.status(201).json(
            {
                message: "User registered successfully",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    personalDetails: newUser.personalDetails,
                    serviceDetails: newUser.serviceDetails,
                    currentStatus: newUser.currentStatus
                },
            }
        );
    } catch (error) {
        if (error.code === 11000) {
            const message = error.keyPattern?.email
                ? "Email is already registered"
                : "Username is already taken";

            return res.status(400).json({ message });
        }

        next(error);
    }
}




/**
 * @name loginUserController
 * @description Login a user
 * @access Public
 */
async function loginUserController(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json(
                { message: "Invalid email or password" }
            );
        }

        if (!user.passwordHash) {
            return res.status(401).json({
                message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.`
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json(
                { message: "Invalid email or password" }
            );
        }

        const token = jwt.sign(
            { Id: user._id, username: user.username, role: user.role },
            env.jwtSecret,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, authCookieOptions);

        res.status(200).json(
            {
                message: "User logged in successfully",
                user: { id: user._id, username: user.username, email: user.email, role: user.role },
            }
        );
    } catch (error) {
        next(error);
    }
}



/**
 * @name logoutUserController
 * @description Logout a user
 * @access Public
 */
async function logoutUserController(req, res, next) {
    try {
        const token = req.cookies.token;

        if (token) {
            const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
            await tokenBlacklistModel.create({ token: tokenHash });
        }

        res.clearCookie("token", {
            httpOnly: true,
            secure: env.cookie.secure,
            sameSite: env.cookie.sameSite
        });

        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        next(error);
    }
}


/**
 * @name getMeController
 * @description Get current user information
 * @access Private
 */
async function getMeController(req, res, next) {
    try {
        const user = await UserModel.findById(req.user.Id);

        if (!user) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: env.cookie.secure,
                sameSite: env.cookie.sameSite
            });
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User information retrieved successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role || "personnel",
                personalDetails: user.personalDetails || {},
                serviceDetails: user.serviceDetails || {},
                currentStatus: user.currentStatus || {}
            }
        });
    } catch (error) {
        next(error);
    }
}

export default { registerUserController, loginUserController, logoutUserController, getMeController };

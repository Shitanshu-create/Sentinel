import express from "express";
import oauthController from "../controllers/oauth.controller.js";

const oauthRouter = express.Router();

/**
 * @route GET /api/auth/google
 * @desc Redirect to Google OAuth consent screen
 */
oauthRouter.get("/google", oauthController.redirectToGoogle);

/**
 * @route GET /api/auth/google/callback
 * @desc Handle Google OAuth callback
 */
oauthRouter.get("/google/callback", oauthController.googleCallback);

/**
 * @route GET /api/auth/github
 * @desc Redirect to GitHub OAuth consent screen
 */
oauthRouter.get("/github", oauthController.redirectToGithub);

/**
 * @route GET /api/auth/github/callback
 * @desc Handle GitHub OAuth callback
 */
oauthRouter.get("/github/callback", oauthController.githubCallback);

export default oauthRouter;

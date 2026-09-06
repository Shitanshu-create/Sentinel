import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import env from "../config/env.js";
import { exchangeGoogleCode, exchangeGithubCode } from "../services/oauth.service.js";
import crypto from "crypto";

const authCookieOptions = {
    httpOnly: true,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: env.cookie.maxAge
};

/**
 * Find existing OAuth user or create a new one.
 */
async function findOrCreateOAuthUser({ email, name, provider, providerId }) {
    let user = await UserModel.findOne({ provider, providerId });

    if (user) return user;

    const existingEmail = await UserModel.findOne({ email });

    if (existingEmail && existingEmail.provider === "local") {
        throw new Error("EMAIL_EXISTS");
    }

    if (existingEmail) return existingEmail;

    let username = name;
    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
        username = `${name}_${providerId.slice(-4)}`;
    }

    user = new UserModel({
        username,
        email,
        passwordHash: null,
        provider,
        providerId
    });

    await user.save();
    return user;
}

/**
 * Issue JWT cookie and redirect to frontend.
 */
function issueTokenAndRedirect(res, user) {
    const token = jwt.sign(
        { Id: user._id, username: user.username },
        env.jwtSecret,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, authCookieOptions);
    res.redirect(`${env.corsOrigin}/journal`);
}

/* ── Google ── */

function redirectToGoogle(req, res) {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, {
        httpOnly: true,
        secure: env.cookie.secure,
        sameSite: "Lax",
        maxAge: 5 * 60 * 1000
    });

    const params = new URLSearchParams({
        client_id: env.googleClientId,
        redirect_uri: `${env.corsOrigin}/api/auth/google/callback`,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
        state
    });

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

async function googleCallback(req, res) {
    try {
        const { code, state } = req.query;
        const expected = req.cookies.oauth_state;
        res.clearCookie("oauth_state");

        if (!state || state !== expected) {
            return res.redirect(`${env.corsOrigin}/login?error=csrf_failed`);
        }

        if (!code) throw new Error("No authorization code received");

        const profile = await exchangeGoogleCode(code);
        const user = await findOrCreateOAuthUser({
            email: profile.email,
            name: profile.name,
            provider: "google",
            providerId: profile.providerId
        });

        issueTokenAndRedirect(res, user);
    } catch (error) {
        console.error("Google OAuth error:", error);
        const msg = error.message === "EMAIL_EXISTS" ? "email_exists" : "oauth_failed";
        res.redirect(`${env.corsOrigin}/login?error=${msg}`);
    }
}

/* ── GitHub ── */

function redirectToGithub(req, res) {
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, {
        httpOnly: true,
        secure: env.cookie.secure,
        sameSite: "Lax",
        maxAge: 5 * 60 * 1000
    });

    const params = new URLSearchParams({
        client_id: env.githubClientId,
        redirect_uri: `${env.corsOrigin}/api/auth/github/callback`,
        scope: "user:email",
        state
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}

async function githubCallback(req, res) {
    try {
        const { code, state } = req.query;
        const expected = req.cookies.oauth_state;
        res.clearCookie("oauth_state");

        if (!state || state !== expected) {
            return res.redirect(`${env.corsOrigin}/login?error=csrf_failed`);
        }

        if (!code) throw new Error("No authorization code received");

        const profile = await exchangeGithubCode(code);
        const user = await findOrCreateOAuthUser({
            email: profile.email,
            name: profile.name,
            provider: "github",
            providerId: profile.providerId
        });

        issueTokenAndRedirect(res, user);
    } catch (error) {
        console.error("GitHub OAuth error:", error);
        const msg = error.message === "EMAIL_EXISTS" ? "email_exists" : "oauth_failed";
        res.redirect(`${env.corsOrigin}/login?error=${msg}`);
    }
}

export default { redirectToGoogle, googleCallback, redirectToGithub, githubCallback };

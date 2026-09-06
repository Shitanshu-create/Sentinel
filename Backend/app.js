import express from "express";
import authRouter from "./routes/auth.routes.js";
import oauthRouter from "./routes/oauth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import journalRouter from "./routes/journal.route.js";
import env from "./config/env.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import crypto from "crypto";


const app = express();
const csrfProtection = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    
    const cookieToken = req.cookies[env.csrfCookieName];
    const headerToken = req.headers['csrf-token'] || req.headers['x-csrf-token'];
    
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        const error = new Error("Invalid CSRF token");
        error.code = "EBADCSRFTOKEN";
        return next(error);
    }
    next();
};

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'", env.corsOrigin]
        }
    }
}));

const allowedOrigins = new Set([
    env.corsOrigin,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

app.use(rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false
}));
app.use(cookieParser());
app.use(express.json({ limit: env.jsonLimit }));

app.get("/api/health", (req, res) => res.status(200).send("OK"));

// OAuth routes mounted BEFORE CSRF (provider callbacks don't carry CSRF tokens)
app.use("/api/auth", oauthRouter);

app.get("/api/csrf-token", (req, res) => {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(env.csrfCookieName, token, {
        httpOnly: true,
        secure: env.cookie.secure,
        sameSite: env.cookie.sameSite
    });
    res.status(200).json({ csrfToken: token });
});
app.use(csrfProtection);
app.use("/api/auth", authRouter);
app.use("/api/journal", journalRouter);
app.use(notFoundHandler);
app.use(errorHandler);


export default app;


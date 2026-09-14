import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const requiredEnv = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || process.env.jwtSecret,
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY
};

const missingEnv = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

if (missingEnv.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnv.join(", ")}`);
}

const parseBoolean = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    const clean = String(value).trim().toLowerCase();
    return clean === "true";
};

const parseInteger = (value, fallback) => {
    if (value === undefined || value === null) return fallback;
    const parsed = Number.parseInt(String(value).trim(), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
    nodeEnv: typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV.trim() : (process.env.NODE_ENV || "development"),
    port: parseInteger(process.env.PORT, 3000),
    mongoUri: typeof requiredEnv.MONGO_URI === "string" ? requiredEnv.MONGO_URI.trim() : requiredEnv.MONGO_URI,
    jwtSecret: typeof requiredEnv.JWT_SECRET === "string" ? requiredEnv.JWT_SECRET.trim() : requiredEnv.JWT_SECRET,
    corsOrigin: typeof process.env.CORS_ORIGIN === "string" ? process.env.CORS_ORIGIN.trim() : (process.env.CORS_ORIGIN || "http://localhost:5173"),
    jsonLimit: typeof process.env.JSON_LIMIT === "string" ? process.env.JSON_LIMIT.trim() : (process.env.JSON_LIMIT || "10mb"),
    rateLimit: {
        windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        max: parseInteger(process.env.RATE_LIMIT_MAX, 300)
    },
    backendUrl: typeof process.env.BACKEND_URL === "string" ? process.env.BACKEND_URL.trim() : (process.env.BACKEND_URL || `http://localhost:${parseInteger(process.env.PORT, 3000)}`),
    cookie: {
        secure: parseBoolean(process.env.COOKIE_SECURE, typeof process.env.NODE_ENV === "string" && process.env.NODE_ENV.trim() === "production"),
        sameSite: typeof process.env.COOKIE_SAME_SITE === "string" ? process.env.COOKIE_SAME_SITE.trim() : (process.env.COOKIE_SAME_SITE || "Lax"),
        maxAge: parseInteger(process.env.COOKIE_MAX_AGE_MS, 24 * 60 * 60 * 1000)
    },
    csrfCookieName: typeof process.env.CSRF_COOKIE_NAME === "string" ? process.env.CSRF_COOKIE_NAME.trim() : (process.env.CSRF_COOKIE_NAME || "_csrf"),
    googleGenAiApiKey: typeof requiredEnv.GOOGLE_GENAI_API_KEY === "string" ? requiredEnv.GOOGLE_GENAI_API_KEY.trim() : requiredEnv.GOOGLE_GENAI_API_KEY,
    geminiModel: typeof process.env.GEMINI_MODEL === "string" ? process.env.GEMINI_MODEL.trim() : (process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview"),
    googleClientId: typeof process.env.GOOGLE_CLIENT_ID === "string" ? process.env.GOOGLE_CLIENT_ID.trim() : (process.env.GOOGLE_CLIENT_ID || ""),
    googleClientSecret: typeof process.env.GOOGLE_CLIENT_SECRET === "string" ? process.env.GOOGLE_CLIENT_SECRET.trim() : (process.env.GOOGLE_CLIENT_SECRET || ""),
    githubClientId: typeof process.env.GITHUB_CLIENT_ID === "string" ? process.env.GITHUB_CLIENT_ID.trim() : (process.env.GITHUB_CLIENT_ID || ""),
    githubClientSecret: typeof process.env.GITHUB_CLIENT_SECRET === "string" ? process.env.GITHUB_CLIENT_SECRET.trim() : (process.env.GITHUB_CLIENT_SECRET || "")
};

export default env;

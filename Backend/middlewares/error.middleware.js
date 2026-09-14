import { ZodError } from "zod";
import env from "../config/env.js";

function notFoundHandler(req, res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        });
    }

    if (error.code === "EBADCSRFTOKEN") {
        return res.status(403).json({ message: "Invalid CSRF token" });
    }

    const statusCode = error.statusCode || error.status || 500;
    const response = {
        message: statusCode >= 500 ? "Internal server error" : error.message
    };

    if (env.nodeEnv !== "production" && statusCode >= 500) {
        response.error = error.message;
    }

    return res.status(statusCode).json(response);
}

export { notFoundHandler, errorHandler };

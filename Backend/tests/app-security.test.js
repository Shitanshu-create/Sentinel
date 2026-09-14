import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

describe("security middleware", () => {
    it("sets helmet headers and issues csrf tokens", async () => {
        const response = await request(app).get("/api/csrf-token").expect(200);

        expect(response.headers["x-content-type-options"]).toBe("nosniff");
        expect(response.body.csrfToken).toBeTruthy();
    });

    it("uses centralized not-found handling", async () => {
        const response = await request(app).get("/missing-route").expect(404);

        expect(response.body.message).toContain("Route not found");
    });
});

import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";
import {
    chatSchema,
    idParamSchema,
    journalEntrySchema,
    journalUpdateSchema
} from "../validations/journal.validation.js";

describe("auth validation", () => {
    it("accepts valid registration data", () => {
        expect(registerSchema.parse({
            username: "Ada",
            email: "ada@example.com",
            password: "password123"
        }).email).toBe("ada@example.com");
    });

    it("rejects weak auth payloads", () => {
        expect(() => loginSchema.parse({ email: "bad", password: "" }))
            .toThrow("Enter a valid email address");
        expect(() => registerSchema.parse({ username: "A", email: "a@b.com", password: "short" }))
            .toThrow("Username must be at least 2 characters");
        expect(() => registerSchema.parse({ username: "Ada", email: "ada@example.com", password: "short" }))
            .toThrow("Password must be at least 8 characters");
    });
});

describe("journal validation", () => {
    it("accepts journal CRUD and AI chat payloads", () => {
        expect(journalEntrySchema.parse({ chat: "hello", aiActive: false }).aiActive).toBe(false);
        expect(journalUpdateSchema.parse({ chat: "updated", title: "Today" }).title).toBe("Today");
        expect(chatSchema.parse({ message: "summarize my week" }).message).toBe("summarize my week");
        expect(idParamSchema.parse({ id: "507f1f77bcf86cd799439011" }).id).toBe("507f1f77bcf86cd799439011");
    });

    it("rejects invalid journal inputs", () => {
        expect(() => journalEntrySchema.parse({ chat: "" })).toThrow();
        expect(() => chatSchema.parse({ message: "" })).toThrow();
        expect(() => idParamSchema.parse({ id: "not-an-id" })).toThrow();
    });
});

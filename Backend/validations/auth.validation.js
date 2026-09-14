import { z } from "zod";

const email = z.string({ error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254, "Email must be 254 characters or less");

const password = z.string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or less");

const personalDetailsSchema = z.object({
    name: z.string({ error: "Name is required" }).trim().min(2, "Name must be at least 2 characters").max(100, "Name must be 100 characters or less"),
    age: z.union([z.number(), z.string()]).transform(v => (v === '' || v === null || v === undefined ? null : Number(v))).pipe(
        z.number().int().min(18, "Age must be at least 18").max(65, "Age must be 65 or less").nullable()
    ).optional().nullable(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
    phoneNo: z.string().trim().max(15, "Phone number max 15 characters").optional().nullable(),
    email
});

const serviceDetailsSchema = z.object({
    rank: z.string().trim().max(60).optional().nullable(),
    jobType: z.string().trim().max(100).optional().nullable(),
    unit: z.string().trim().max(100).optional().nullable(),
    force: z.string().trim().max(100).optional().nullable()
}).optional().nullable();

const loginCredentialsSchema = z.object({
    username: z.string({ error: "Username is required" })
        .trim()
        .min(2, "Username must be at least 2 characters")
        .max(60, "Username must be 60 characters or less"),
    password
});

const registerSchema = z.object({
    personalDetails: personalDetailsSchema.optional(),
    serviceDetails: serviceDetailsSchema.optional(),
    loginCredentials: loginCredentialsSchema.optional(),
    role: z.enum(["personnel", "welfare_officer", "commander"]).optional().default("personnel"),
    // Fallback flat fields
    username: z.string().trim().min(2, "Username must be at least 2 characters").max(60, "Username must be 60 characters or less").optional(),
    email: email.optional(),
    password: password.optional()
}).refine(data => {
    const hasNested = Boolean(data.loginCredentials?.username && data.loginCredentials?.password && data.personalDetails?.email);
    const hasFlat = Boolean(data.username && data.email && data.password);
    return hasNested || hasFlat;
}, { message: "Required registration fields are missing" });

const loginSchema = z.object({
    email,
    password: z.string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be 128 characters or less")
});

export { registerSchema, loginSchema, serviceDetailsSchema };

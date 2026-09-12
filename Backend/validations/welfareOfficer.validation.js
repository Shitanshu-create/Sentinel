import { z } from "zod";

const idParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
});

const welfareNoteSchema = z.object({
    note: z.string().trim().min(1, "Note content is required").max(2000, "Note must be 2000 characters or less"),
    actionType: z.enum([
        "confidential_check",
        "workload_review",
        "leave_review",
        "rest_recommendation",
        "counseling_referral",
        "general_note"
    ]).optional().default("general_note")
});

export { idParamSchema, welfareNoteSchema };

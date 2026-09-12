import { z } from "zod";

const unitParamSchema = z.object({
    unitName: z.string().trim().min(1, "Unit name is required").max(100, "Unit name too long")
});

const organizationalNoteSchema = z.object({
    note: z.string().trim().min(1, "Note content is required").max(2000, "Note must be 2000 characters or less"),
    actionType: z.enum([
        "workload_review",
        "staffing_review",
        "duty_schedule_review",
        "leave_policy_review",
        "recognition",
        "general_note"
    ]).optional().default("general_note")
});

export { unitParamSchema, organizationalNoteSchema };

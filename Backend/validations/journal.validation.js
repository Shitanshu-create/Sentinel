import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const uploadedFileSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: z.string().trim().min(1).max(120),
    data: z.string().min(1)
});

const journalEntrySchema = z.object({
    chat: z.string().trim().min(1).max(20000),
    title: z.string().trim().min(1).max(180).optional(),
    aiActive: z.boolean().optional(),
    uploadedFiles: z.array(uploadedFileSchema).max(5).optional()
});

const journalUpdateSchema = journalEntrySchema.omit({ uploadedFiles: true });

const chatSchema = z.object({
    message: z.string().trim().min(1).max(4000),
    conversationHistory: z.array(z.object({
        role: z.enum(["user", "ai"]),
        text: z.string().max(8000)
    })).max(20).optional()
});

const idParamSchema = z.object({
    id: objectId
});

export { journalEntrySchema, journalUpdateSchema, chatSchema, idParamSchema };

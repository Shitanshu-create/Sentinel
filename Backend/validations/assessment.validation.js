import { z } from "zod";

const idParamSchema = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
});

const assessmentIdParamSchema = z.object({
    assessmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
});

const assignAssessmentSchema = z.object({
    questionIds: z.array(z.string()).min(4, "Select at least 4 questions").max(5, "Select at most 5 questions")
});

const submitAssessmentSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string(),
        answerText: z.string().trim().min(1, "Answer cannot be empty").max(2000, "Answer must be 2000 characters or less")
    })).min(1, "At least one answer is required")
});

export { idParamSchema, assessmentIdParamSchema, assignAssessmentSchema, submitAssessmentSchema };

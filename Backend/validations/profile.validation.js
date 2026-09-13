import { z } from "zod";
import { serviceDetailsSchema } from "./auth.validation.js";

const dateField = z.coerce.date().optional().nullable();

const profilePersonalDetailsSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    age: z.union([z.number(), z.string()]).transform(v => (v === '' || v === null || v === undefined ? null : Number(v))).pipe(
        z.number().int().min(18).max(65).nullable()
    ).optional().nullable(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional().nullable(),
    phoneNo: z.string().trim().max(15).optional().nullable()
}).optional();

const deploymentEntrySchema = z.object({
    location: z.string().trim().max(150).optional().nullable(),
    startDate: dateField,
    endDate: dateField
});

const transferEntrySchema = z.object({
    fromUnit: z.string().trim().max(100).optional().nullable(),
    toUnit: z.string().trim().max(100).optional().nullable(),
    location: z.string().trim().max(150).optional().nullable(),
    transferDate: dateField
});

const trainingEntrySchema = z.object({
    name: z.string().trim().max(150).optional().nullable(),
    startDate: dateField,
    endDate: dateField
});

const currentStatusUpdateSchema = z.object({
    postingLocation: z.string().trim().max(150).optional().nullable(),
    estimatedWorkHours: z.union([z.number(), z.string()]).transform(v => (v === '' || v === null || v === undefined ? null : Number(v))).pipe(
        z.number().min(0).max(24).nullable()
    ).optional().nullable(),
    lastLeaveDate: dateField,
    dutySchedule: z.string().trim().max(200).optional().nullable(),
    deploymentHistory: z.array(deploymentEntrySchema).max(20).optional(),
    transferHistory: z.array(transferEntrySchema).max(20).optional(),
    trainingCommitments: z.array(trainingEntrySchema).max(20).optional(),
    workloadLevel: z.enum(["light", "moderate", "heavy", "overloaded"]).optional().nullable(),
    workloadNotes: z.string().trim().max(300).optional().nullable()
}).optional();

const updateProfileSchema = z.object({
    personalDetails: profilePersonalDetailsSchema,
    serviceDetails: serviceDetailsSchema,
    currentStatus: currentStatusUpdateSchema
});

export { updateProfileSchema };

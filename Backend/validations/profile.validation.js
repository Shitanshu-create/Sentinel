import { z } from "zod";
import { serviceDetailsSchema } from "./auth.validation.js";

const emptyToNull = (schema) =>
    z.union([schema, z.literal(""), z.null()])
        .transform((v) => (!v ? null : v))
        .optional()
        .nullable();

const dateField = z
    .union([z.date(), z.string(), z.null()])
    .transform((v) => {
        if (!v || v === "") return null;
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
    })
    .optional()
    .nullable();

const profilePersonalDetailsSchema = z.object({
    name: z.string().trim().max(100).optional().nullable(),
    age: z.union([z.number(), z.string()]).transform(v => (v === '' || v === null || v === undefined ? null : Number(v))).pipe(
        z.number().int().min(18).max(65).nullable()
    ).optional().nullable(),
    gender: emptyToNull(z.enum(["male", "female", "other", "prefer_not_to_say"])),
    phoneNo: z.string().trim().max(15).optional().nullable()
}).optional().nullable();

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
    workloadLevel: emptyToNull(z.enum(["light", "moderate", "heavy", "overloaded"])),
    workloadNotes: z.string().trim().max(300).optional().nullable()
}).optional().nullable();

const updateProfileSchema = z.object({
    personalDetails: profilePersonalDetailsSchema,
    serviceDetails: serviceDetailsSchema,
    currentStatus: currentStatusUpdateSchema
});

export { updateProfileSchema };

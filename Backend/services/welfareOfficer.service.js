import UserModel from "../models/user.model.js";
import UserStats from "../models/userStats.model.js";
import journalReportModel from "../models/journalReport.model.js";
import { getOrGenerateInsights } from "./journal.service.js";

// Returns personnel sharing the officer's force AND unit (fixes the unit-name-collision bug — see PRD Section 0)
async function getRosterForOfficer(officerId) {
    const officer = await UserModel.findById(officerId).select("serviceDetails.force serviceDetails.unit");
    const officerForce = officer?.serviceDetails?.force?.trim().toLowerCase();
    const officerUnit = officer?.serviceDetails?.unit?.trim().toLowerCase();

    if (!officerForce || !officerUnit) return [];

    const personnel = await UserModel.find({
        role: "personnel"
    }).select("username personalDetails.name serviceDetails currentStatus");

    // Case-insensitive force AND unit match
    const matched = personnel.filter(
        (p) => p.serviceDetails?.force?.trim().toLowerCase() === officerForce
            && p.serviceDetails?.unit?.trim().toLowerCase() === officerUnit
    );

    const userIds = matched.map((p) => p._id);
    const statsMap = await UserStats.find({ userId: { $in: userIds } });
    const statsByUser = Object.fromEntries(statsMap.map((s) => [String(s.userId), s]));

    return matched.map((p) => ({
        id: p._id,
        name: p.personalDetails?.name || p.username,
        rank: p.serviceDetails?.rank || null,
        unit: p.serviceDetails?.unit || null,
        force: p.serviceDetails?.force || null,
        postingLocation: p.currentStatus?.postingLocation || null,
        stats: statsByUser[String(p._id)] || null
    }));
}

// Individual detail view — scores, trends, and AI insights, never chat/reflection (see PRD 1.3)
async function getPersonnelDetail(personnelId) {
    const person = await UserModel.findById(personnelId)
        .select("username personalDetails serviceDetails currentStatus role");

    if (!person || person.role !== "personnel") return null;

    const stats = await UserStats.findOne({ userId: personnelId });

    const recentEntries = await journalReportModel.find({ userId: personnelId })
        .select("date gemini_response sleepHours") // explicitly excludes chat + reflection
        .sort({ date: -1 })
        .limit(30);

    // Reuses the same cache-or-generate logic the personnel's own dashboard uses,
    // parameterized by this personnel's ID instead of the logged-in officer's.
    const insights = await getOrGenerateInsights(personnelId);

    return { person, stats, recentEntries, insights };
}

export { getRosterForOfficer, getPersonnelDetail };

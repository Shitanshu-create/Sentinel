import UserModel from "../models/user.model.js";
import UserStats from "../models/userStats.model.js";
import journalReportModel from "../models/journalReport.model.js";

async function getDepartmentForCommander(commanderId) {
    const commander = await UserModel.findById(commanderId).select("serviceDetails.department");
    return commander?.serviceDetails?.department?.trim().toLowerCase() || null;
}

// Department-wide summary, grouped by unit — never returns individual names
async function getUnitsSummaryForDepartment(department) {
    if (!department) return [];

    const personnel = await UserModel.find({ role: "personnel" })
        .select("serviceDetails.unit serviceDetails.department");

    const matched = personnel.filter(
        (p) => p.serviceDetails?.department?.trim().toLowerCase() === department
    );

    const userIds = matched.map((p) => p._id);
    const statsMap = await UserStats.find({ userId: { $in: userIds } });
    const statsByUser = Object.fromEntries(statsMap.map((s) => [String(s.userId), s]));

    // Group personnel by unit
    const byUnit = {};
    matched.forEach((p) => {
        const unitName = p.serviceDetails?.unit?.trim() || "Unassigned";
        if (!byUnit[unitName]) byUnit[unitName] = [];
        byUnit[unitName].push(statsByUser[String(p._id)] || null);
    });

    const RISK_SEVERITY = { normal: 0, elevated: 1, high: 2, critical: 3 };

    return Object.entries(byUnit).map(([unitName, statsList]) => {
        const validStats = statsList.filter(Boolean);
        const count = statsList.length;

        const avgStress = validStats.length > 0
            ? Math.round(validStats.reduce((sum, s) => sum + (s.currentStressStatus || 0), 0) / validStats.length)
            : 0;

        const sleepValues = validStats.filter((s) => s.avgSleepHours !== null && s.avgSleepHours !== undefined);
        const avgSleep = sleepValues.length > 0
            ? Math.round((sleepValues.reduce((sum, s) => sum + s.avgSleepHours, 0) / sleepValues.length) * 10) / 10
            : null;

        // Worst-case risk level, not average — see PRD 1.2.1
        const worstRisk = validStats.reduce((worst, s) => {
            const level = s.wellnessRiskLevel || "normal";
            return RISK_SEVERITY[level] > RISK_SEVERITY[worst] ? level : worst;
        }, "normal");

        return { unit: unitName, personnelCount: count, avgStress, avgSleep, riskLevel: worstRisk };
    });
}

// Aggregated, anonymized trend data for one unit — no personnel names/IDs anywhere in the response
async function getUnitDetail(department, unitName) {
    const personnel = await UserModel.find({ role: "personnel" })
        .select("serviceDetails.unit serviceDetails.department");

    const matched = personnel.filter(
        (p) => p.serviceDetails?.department?.trim().toLowerCase() === department
            && p.serviceDetails?.unit?.trim() === unitName
    );

    if (matched.length === 0) return null; // also guards against a commander requesting a unit outside their department

    const userIds = matched.map((p) => p._id);
    const statsList = await UserStats.find({ userId: { $in: userIds } });

    const RISK_SEVERITY = { normal: 0, elevated: 1, high: 2, critical: 3 };
    const worstRisk = statsList.reduce((worst, s) => {
        const level = s.wellnessRiskLevel || "normal";
        return RISK_SEVERITY[level] > RISK_SEVERITY[worst] ? level : worst;
    }, "normal");

    const avg = (field) => {
        const values = statsList.filter((s) => s[field] !== null && s[field] !== undefined);
        return values.length > 0 ? values.reduce((sum, s) => sum + s[field], 0) / values.length : null;
    };

    // Synthetic "unit stats" object — deliberately shaped exactly like a UserStats document
    // so the existing useStressStatus/useWellnessRisk/useWellnessOverview hooks work unmodified.
    const unitStats = {
        currentStressStatus: Math.round(avg("currentStressStatus") || 0),
        wellnessRiskLevel: worstRisk,
        avgSleepHours: avg("avgSleepHours"),
        avgMoodScore: avg("avgMoodScore")
    };

    // Flat, anonymized entry list across every person in the unit — date/scores/sleep only,
    // no userId, no chat, no reflection. Capped to keep the payload reasonable for a
    // multi-person aggregate (unlike the single-person detail view's cap of 30).
    const entries = await journalReportModel.find({ userId: { $in: userIds } })
        .select("date gemini_response sleepHours")
        .sort({ date: -1 })
        .limit(500);

    return {
        unit: unitName,
        department,
        personnelCount: matched.length,
        stats: unitStats,
        entries
    };
}

export { getDepartmentForCommander, getUnitsSummaryForDepartment, getUnitDetail };

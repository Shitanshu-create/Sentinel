import journalReportModel from "../models/journalReport.model.js";
import UserStats from "../models/userStats.model.js";

const toDayKey = (date) => new Date(date).toISOString().split("T")[0];

const scoreAverage = (entry) => {
    const scores = entry.gemini_response || {};
    // Positive emotions: calmness, productivity, happiness — higher is better
    // Negative emotions: anxious, sadness — invert (100 - score) so that LOW anxiety/sadness = HIGH wellness
    return (
        (scores.calmness_score || 0)
        + (100 - (scores.anxious_score || 0))
        + (scores.productivity_score || 0)
        + (100 - (scores.sadness_score || 0))
        + (scores.happiness_score || 0)
    ) / 5;
};


async function recalculateUserStats(userId) {
    const entries = await journalReportModel.find({ userId }).select('date chat gemini_response sleepHours').sort({ date: 1 });

    if (entries.length === 0) {
        await UserStats.findOneAndUpdate(
            { userId },
            {
                totalEntries: 0,
                totalWords: 0,
                longestStreak: 0,
                currentStreak: 0,
                avgMoodScore: 0,
                currentStressStatus: 0,
                wellnessRiskLevel: "normal",
                avgSleepHours: null,
                lastEntryDate: null
            },
            { upsert: true, returnDocument: "after" }
        );
        return;
    }

    const totalWords = entries.reduce((sum, entry) => {
        return sum + entry.chat.trim().split(/\s+/).filter(Boolean).length;
    }, 0);

    const avgMoodScore = entries.reduce((sum, entry) => sum + scoreAverage(entry), 0) / entries.length;

    const entriesWithSleep = entries.filter(e => e.sleepHours !== null && e.sleepHours !== undefined);
    const avgSleepHours = entriesWithSleep.length > 0
        ? Math.round((entriesWithSleep.reduce((sum, e) => sum + e.sleepHours, 0) / entriesWithSleep.length) * 10) / 10
        : null;

    // Calculate currentStressStatus (average of stress scores across recent entries)
    const entriesWithStress = entries.filter(e => e.gemini_response?.stress_score !== undefined);
    const currentStressStatus = entriesWithStress.length > 0
        ? Math.round(entriesWithStress.reduce((sum, e) => sum + (e.gemini_response.stress_score || 0), 0) / entriesWithStress.length)
        : Math.round(entries.reduce((sum, e) => sum + (e.gemini_response?.anxious_score || 30), 0) / entries.length);

    // Calculate overall wellness risk level
    const latestRiskLevel = entries[entries.length - 1]?.gemini_response?.risk_level;
    let wellnessRiskLevel = "normal";
    if (latestRiskLevel) {
        wellnessRiskLevel = latestRiskLevel;
    } else if (currentStressStatus >= 75) {
        wellnessRiskLevel = "critical";
    } else if (currentStressStatus >= 60) {
        wellnessRiskLevel = "high";
    } else if (currentStressStatus >= 45) {
        wellnessRiskLevel = "elevated";
    }

    const dayKeys = [...new Set(entries.map((entry) => toDayKey(entry.date)))];
    let longestStreak = 0;
    let activeStreak = 0;
    let previousDate = null;

    for (const dayKey of dayKeys) {
        const [year, month, day] = dayKey.split("-").map(Number);
        const currentDate = new Date(year, month - 1, day);

        if (previousDate) {
            const diffDays = Math.round((currentDate - previousDate) / (24 * 60 * 60 * 1000));
            activeStreak = diffDays === 1 ? activeStreak + 1 : 1;
        } else {
            activeStreak = 1;
        }

        longestStreak = Math.max(longestStreak, activeStreak);
        previousDate = currentDate;
    }

    const latestEntry = entries[entries.length - 1];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestEntryDay = new Date(latestEntry.date);
    latestEntryDay.setHours(0, 0, 0, 0);

    const diffFromToday = Math.round((today - latestEntryDay) / (24 * 60 * 60 * 1000));
    const currentStreak = diffFromToday <= 1 ? activeStreak : 0;

    await UserStats.findOneAndUpdate(
        { userId },
        {
            totalEntries: entries.length,
            totalWords,
            longestStreak,
            currentStreak,
            avgMoodScore,
            currentStressStatus,
            wellnessRiskLevel,
            avgSleepHours,
            lastEntryDate: latestEntry.date
        },
        { upsert: true, returnDocument: "after" }
    );
}

export { recalculateUserStats };

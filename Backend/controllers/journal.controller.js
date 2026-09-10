import generateJournalReport, { generateGlobalInsights } from "../services/journal.service.js";
import journalReportModel from "../models/journalReport.model.js";
import UserStats from "../models/userStats.model.js";
import InsightsCache from "../models/insightsCache.model.js";
import { recalculateUserStats } from "../services/stats.service.js";
import { sanitizeForPrompt } from "../utils/sanitize.js";

/**
 * @desc Generate a journal report based on the provided journal entry.
 */
async function generateJournalReportController(req, res) {
    try {
        if (!req.body.chat) {
            return res.status(400).json({ message: "Journal entry (chat) is required" });
        }

        let journalReportByAi;
        const isPrivate = req.body.aiActive === false;

        /* If AI is disabled by the user, skip the Gemini API call to preserve privacy */
        if (isPrivate) {
            journalReportByAi = {
                reflection: ["Private Entry - AI Analysis disabled"],
                gemini_response: {
                    calmness_score: 0,
                    anxious_score: 0,
                    productivity_score: 0,
                    sadness_score: 0,
                    happiness_score: 0,
                    stress_score: 0,
                    risk_level: "normal"
                }
            };
        } else {
            journalReportByAi = await generateJournalReport({
                chat: req.body.chat
            });
        }

        /* Parse media images if provided */
        const media = [];
        if (req.body.uploadedFiles && Array.isArray(req.body.uploadedFiles)) {
            const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB per file
            for (const file of req.body.uploadedFiles) {
                if (file.data) {
                    /* Convert base64 to buffer */
                    const base64Data = file.data.split(',')[1] || file.data;
                    const byteLength = Buffer.byteLength(base64Data, 'base64');
                    
                    if (byteLength > MAX_FILE_SIZE) {
                        return res.status(400).json({ message: "File too large (max 2MB per file)" });
                    }

                    media.push({
                        data: Buffer.from(base64Data, 'base64'),
                        contentType: file.type || 'application/octet-stream',
                        filename: file.name
                    });
                }
            }
        }

        const journalReport = await journalReportModel.create({
            userId: req.user.Id, /* Associate with logged-in user */
            date: new Date(),
            chat: req.body.chat,
            title: req.body.title || "Untethered Thoughts",
            reflection: journalReportByAi.reflection,
            media: media,
            isPrivate,
            sleepHours: req.body.sleepHours ?? null,
            gemini_response: journalReportByAi.gemini_response
        });

        await InsightsCache.deleteOne({ userId: req.user.Id });
        await recalculateUserStats(req.user.Id);

        res.status(201).json({
            message: "Journal report generated successfully",
            journalReport,
        });
    } catch (error) {

        console.error("Journal Report Error:", error);
        res.status(500).json({
            message: "Failed to generate journal report"
        });
    }
}

/**
 * @desc Get all journal entries for the logged-in user
*/
async function getJournalEntriesController(req, res) {
    try {
        /* Fetch only entries for the logged-in user */
        const entries = await journalReportModel.find({ userId: req.user.Id }).sort({ date: -1 });

        res.status(200).json({
            message: "Journal entries retrieved successfully",
            entries,
        });
    } catch (error) {
        console.error("Fetch Journal Entries Error:", error);
        res.status(500).json({
            message: "Failed to fetch journal entries"
        });
    }
}

/**
 * @desc Get user stats
 */
async function getUserStatsController(req, res) {
    try {
        let stats = await UserStats.findOne({ userId: req.user.Id });
        
        if (!stats) {
            // If they have no stats object yet, return zeroed defaults
            stats = {
                totalEntries: 0,
                totalWords: 0,
                longestStreak: 0,
                currentStreak: 0,
                avgMoodScore: 0,
                currentStressStatus: 0,
                wellnessRiskLevel: "normal",
                avgSleepHours: null
            };
        }

        res.status(200).json({
            message: "Stats retrieved successfully",
            stats
        });
    } catch (error) {
        console.error("Fetch User Stats Error:", error);
        res.status(500).json({
            message: "Failed to fetch user stats"
        });
    }
}

/**
 * @desc Get global insights based on recent entries
 */
async function getGlobalInsightsController(req, res) {
    try {
        const userId = req.user.Id;

        // 1. Check Cache first
        const cachedInsights = await InsightsCache.findOne({ userId });
        const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

        if (
            cachedInsights
            && cachedInsights.privacyVersion === 1
            && (Date.now() - new Date(cachedInsights.lastGenerated).getTime() < CACHE_DURATION)
        ) {
            return res.status(200).json({
                message: "Insights retrieved from cache",
                insights: cachedInsights.data
            });
        }

        // 2. No Cache or Expired - Fetch Last 15 AI-allowed Entries
        const entries = await journalReportModel.find({ userId, isPrivate: { $ne: true } })
            .sort({ date: -1 })
            .limit(15);

        const filteredEntries = entries.filter((en) => {
            if (en.reflection && en.reflection.some((reflection) => reflection.includes("Private Entry"))) {
                return false;
            }
            return true;
        });

        if (filteredEntries.length < 3) {
            return res.status(200).json({
                message: "Not enough entries for deep analysis yet",
                insights: { observations: [], welfareRecommendations: [] }
            });
        }

        // 3. Prepare text for AI
        const entriesText = filteredEntries.map((en, i) => {
            return `Entry ${i+1} (${en.date.toDateString()}):\nTitle: ${sanitizeForPrompt(en.title)}\nContent: ${sanitizeForPrompt(en.chat)}\nReflections: ${en.reflection.join(', ')}`;
        }).join('\n\n---\n\n');

        // 4. Generate New Insights
        const insights = await generateGlobalInsights({ entriesText });

        // 5. Update/Save Cache atomically to avoid duplicate-key races
        await InsightsCache.findOneAndUpdate(
            { userId },
            {
                data: insights,
                lastGenerated: Date.now(),
                privacyVersion: 1
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        res.status(200).json({
            message: "Insights generated successfully",
            insights
        });
    } catch (error) {
        console.error("Global Insights Error:", error);
        res.status(500).json({
            message: "Failed to generate insights"
        });
    }
}
/**
 * @desc Delete a specific journal entry by ID
 */
async function deleteJournalController(req, res) {
    try {
        const { id } = req.params;
        const entry = await journalReportModel.findOneAndDelete({ _id: id, userId: req.user.Id });
        
        if (!entry) {
            return res.status(404).json({ message: "Journal entry not found or unauthorized to delete." });
        }

        await InsightsCache.deleteOne({ userId: req.user.Id });
        await recalculateUserStats(req.user.Id);
        
        res.status(200).json({ message: "Journal entry deleted successfully" });
    } catch (error) {
        console.error("Delete Journal Error:", error);
        res.status(500).json({ message: "Failed to delete journal entry" });
    }
}

/**
 * @desc Modify a specific journal entry by ID
 */
async function modifyJournalController(req, res) {
    try {
        const { id } = req.params;
        const { chat, title, aiActive } = req.body;

        if (!chat) {
            return res.status(400).json({ message: "Journal entry (chat) is required" });
        }

        const existingEntry = await journalReportModel.findOne({ _id: id, userId: req.user.Id });
        
        if (!existingEntry) {
            return res.status(404).json({ message: "Journal entry not found or unauthorized to modify." });
        }

        let journalReportByAi;
        const isPrivate = aiActive === false;
        
        /* If AI is disabled by the user, skip the Gemini API call */
        if (isPrivate) {
            journalReportByAi = {
                reflection: ["Private Entry - AI Analysis disabled"],
                gemini_response: {
                    calmness_score: 0,
                    anxious_score: 0,
                    productivity_score: 0,
                    sadness_score: 0,
                    happiness_score: 0,
                    stress_score: 0,
                    risk_level: "normal"
                }
            };
        } else {
            journalReportByAi = await generateJournalReport({ chat });
        }

        existingEntry.chat = chat;
        if (title) existingEntry.title = title;
        if (req.body.sleepHours !== undefined) existingEntry.sleepHours = req.body.sleepHours;
        existingEntry.reflection = journalReportByAi.reflection;
        existingEntry.gemini_response = journalReportByAi.gemini_response;
        existingEntry.isPrivate = isPrivate;

        await existingEntry.save();
        await InsightsCache.deleteOne({ userId: req.user.Id });
        await recalculateUserStats(req.user.Id);

        res.status(200).json({
            message: "Journal modified successfully",
            entry: existingEntry
        });

    } catch (error) {
        console.error("Modify Journal Error:", error);
        res.status(500).json({ message: "Failed to modify journal entry" });
    }
}

export default { 
    generateJournalReportController, 
    getJournalEntriesController, 
    getUserStatsController,
    getAIObservationsController: getGlobalInsightsController,
    deleteJournalController,
    modifyJournalController
};

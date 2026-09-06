import { beforeEach, describe, expect, it, vi } from "vitest";

const generateJournalReport = vi.fn();
const generateGlobalInsights = vi.fn();
const create = vi.fn();
const find = vi.fn();
const deleteOne = vi.fn();
const recalculateUserStats = vi.fn();

vi.mock("../services/journal.service.js", () => ({
    default: generateJournalReport,
    generateGlobalInsights
}));

vi.mock("../models/journalReport.model.js", () => ({
    default: { create, find }
}));

vi.mock("../models/userStats.model.js", () => ({
    default: {}
}));

vi.mock("../models/insightsCache.model.js", () => ({
    default: {
        deleteOne,
        findOne: vi.fn().mockResolvedValue(null),
        create: vi.fn()
    }
}));

vi.mock("../services/stats.service.js", () => ({
    recalculateUserStats
}));

const journalController = (await import("../controllers/journal.controller.js")).default;

function resMock() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
    };
}

describe("privacy mode", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("marks AI-off journal entries private and skips report generation", async () => {
        const req = {
            user: { Id: "507f1f77bcf86cd799439011" },
            body: { chat: "private note", aiActive: false }
        };
        const res = resMock();
        create.mockResolvedValue({ _id: "entry1", isPrivate: true });

        await journalController.generateJournalReportController(req, res);

        expect(generateJournalReport).not.toHaveBeenCalled();
        expect(create).toHaveBeenCalledWith(expect.objectContaining({
            chat: "private note",
            isPrivate: true
        }));
        expect(recalculateUserStats).toHaveBeenCalledWith(req.user.Id);
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("excludes private entries from global insight generation", async () => {
        const req = { user: { Id: "507f1f77bcf86cd799439011" } };
        const res = resMock();
        find.mockReturnValue({
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([])
            })
        });

        await journalController.getAIObservationsController(req, res);

        expect(find).toHaveBeenCalledWith({
            userId: req.user.Id,
            isPrivate: { $ne: true }
        });
        expect(generateGlobalInsights).not.toHaveBeenCalled();
    });
});

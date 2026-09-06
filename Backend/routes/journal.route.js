import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import journalController from "../controllers/journal.controller.js";
import chatController from "../controllers/chat.controller.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import {
    chatSchema,
    idParamSchema,
    journalEntrySchema,
    journalUpdateSchema
} from "../validations/journal.validation.js";


const journalRouter = express.Router();

/**
 * @route POST /api/journal/chat
 * @description Chat with the AI companion using journal context
 * @access Private
 */
journalRouter.post("/chat", authMiddleware.authUser, validateBody(chatSchema), chatController.chatWithAI);

/**
 * @route POST /api/journal
 * @description Generate a journal report based on the provided journal entry.
 * @access Private
 */
journalRouter.post("/", authMiddleware.authUser, validateBody(journalEntrySchema), journalController.generateJournalReportController);

/**
 * @route GET /api/journal
 * @description Get all journal entries
 * @access Private
 */
journalRouter.get("/", authMiddleware.authUser, journalController.getJournalEntriesController);

/**
 * @route GET /api/journal/stats
 * @description Get user statistics
 * @access Private
 */
journalRouter.get("/stats", authMiddleware.authUser, journalController.getUserStatsController);

/**
 * @route GET /api/journal/observations
 * @description Get AI observations of user patterns
 * @access Private
 */
journalRouter.get("/observations", authMiddleware.authUser, journalController.getAIObservationsController);

/**
 * @route PUT /api/journal/:id
 * @description Modify an existing journal entry
 * @access Private
 */
journalRouter.put("/:id", authMiddleware.authUser, validateParams(idParamSchema), validateBody(journalUpdateSchema), journalController.modifyJournalController);

/**
 * @route DELETE /api/journal/:id
 * @description Delete a journal entry
 * @access Private
 */
journalRouter.delete("/:id", authMiddleware.authUser, validateParams(idParamSchema), journalController.deleteJournalController);

export default journalRouter;

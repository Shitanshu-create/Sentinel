import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import assessmentController from "../controllers/assessment.controller.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import {
    idParamSchema,
    assessmentIdParamSchema,
    assignAssessmentSchema,
    submitAssessmentSchema
} from "../validations/assessment.validation.js";

const assessmentRouter = express.Router();

const requireOfficer = roleMiddleware.requireRole("welfare_officer", "commander", "admin");
const requirePersonnel = roleMiddleware.requireRole("personnel");

/**
 * @route GET /api/assessments/question-bank
 * @description Get the pre-made assessment question bank
 * @access Private (welfare_officer, commander, admin)
 */
assessmentRouter.get("/question-bank", authMiddleware.authUser, requireOfficer, assessmentController.getQuestionBankController);

/**
 * @route POST /api/assessments/personnel/:id
 * @description Assign a new assessment (4-5 questions) to a specific person on the officer's roster
 * @access Private (welfare_officer, commander, admin)
 */
assessmentRouter.post("/personnel/:id", authMiddleware.authUser, requireOfficer, validateParams(idParamSchema), validateBody(assignAssessmentSchema), assessmentController.assignAssessmentController);

/**
 * @route GET /api/assessments/officer
 * @description Get all assessments this officer has assigned, with raw answers and AI analysis
 * @access Private (welfare_officer, commander, admin)
 */
assessmentRouter.get("/officer", authMiddleware.authUser, requireOfficer, assessmentController.getOfficerAssessmentsController);

/**
 * @route GET /api/assessments/mine
 * @description Get all assessments assigned to the logged-in personnel
 * @access Private (personnel)
 */
assessmentRouter.get("/mine", authMiddleware.authUser, requirePersonnel, assessmentController.getMyAssessmentsController);

/**
 * @route POST /api/assessments/:assessmentId/submit
 * @description Submit answers to an assigned assessment
 * @access Private (personnel)
 */
assessmentRouter.post("/:assessmentId/submit", authMiddleware.authUser, requirePersonnel, validateParams(assessmentIdParamSchema), validateBody(submitAssessmentSchema), assessmentController.submitAssessmentController);

export default assessmentRouter;

import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import welfareOfficerController from "../controllers/welfareOfficer.controller.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { idParamSchema, welfareNoteSchema } from "../validations/welfareOfficer.validation.js";

const welfareOfficerRouter = express.Router();

const requireOfficer = roleMiddleware.requireRole("welfare_officer", "commander", "admin");

/**
 * @route GET /api/welfare-officer/roster
 * @description Get all personnel under this welfare officer's unit, with current risk/wellness summary
 * @access Private (welfare_officer, commander, admin)
 */
welfareOfficerRouter.get("/roster", authMiddleware.authUser, requireOfficer, welfareOfficerController.getRosterController);

/**
 * @route GET /api/welfare-officer/personnel/:id
 * @description Get detailed risk/trend data for one person (scores only, never raw journal text)
 * @access Private (welfare_officer, commander, admin)
 */
welfareOfficerRouter.get("/personnel/:id", authMiddleware.authUser, requireOfficer, validateParams(idParamSchema), welfareOfficerController.getPersonnelDetailController);

/**
 * @route POST /api/welfare-officer/personnel/:id/notes
 * @description Log a welfare note/action against a specific person
 * @access Private (welfare_officer, commander, admin)
 */
welfareOfficerRouter.post("/personnel/:id/notes", authMiddleware.authUser, requireOfficer, validateParams(idParamSchema), validateBody(welfareNoteSchema), welfareOfficerController.addWelfareNoteController);

export default welfareOfficerRouter;

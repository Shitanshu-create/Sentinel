import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import commandingOfficerController from "../controllers/commandingOfficer.controller.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { unitParamSchema, organizationalNoteSchema } from "../validations/commandingOfficer.validation.js";

const commandingOfficerRouter = express.Router();

// Note: welfare_officer is deliberately excluded here — see PRD 1.3
const requireCommander = roleMiddleware.requireRole("commander", "admin");

/**
 * @route GET /api/commanding-officer/units
 * @description Get department-wide unit summary (aggregated, no individual names)
 * @access Private (commander, admin)
 */
commandingOfficerRouter.get("/units", authMiddleware.authUser, requireCommander, commandingOfficerController.getUnitsController);

/**
 * @route GET /api/commanding-officer/units/:unitName
 * @description Get aggregated trend detail for one unit within the commander's department
 * @access Private (commander, admin)
 */
commandingOfficerRouter.get("/units/:unitName", authMiddleware.authUser, requireCommander, validateParams(unitParamSchema), commandingOfficerController.getUnitDetailController);

/**
 * @route POST /api/commanding-officer/units/:unitName/notes
 * @description Log an organizational note/action against a unit
 * @access Private (commander, admin)
 */
commandingOfficerRouter.post("/units/:unitName/notes", authMiddleware.authUser, requireCommander, validateParams(unitParamSchema), validateBody(organizationalNoteSchema), commandingOfficerController.addOrganizationalNoteController);

export default commandingOfficerRouter;

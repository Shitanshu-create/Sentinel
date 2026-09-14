import { getForceForCommander, getUnitsSummaryForForce, getUnitDetail } from "../services/commandingOfficer.service.js";
import OrganizationalNote from "../models/organizationalNote.model.js";

async function getUnitsController(req, res) {
    try {
        const force = await getForceForCommander(req.user.Id);
        const units = await getUnitsSummaryForForce(force);
        res.status(200).json({ message: "Unit summary retrieved successfully", force, department: force, units });
    } catch (error) {
        console.error("Get Units Error:", error);
        res.status(500).json({ message: "Failed to fetch unit summary" });
    }
}

async function getUnitDetailController(req, res) {
    try {
        const force = await getForceForCommander(req.user.Id);
        const unitName = decodeURIComponent(req.params.unitName);
        const detail = await getUnitDetail(force, unitName);

        if (!detail) {
            return res.status(404).json({ message: "Unit not found in your force" });
        }

        const notes = await OrganizationalNote.find({ force, unit: unitName }).sort({ createdAt: -1 });

        res.status(200).json({ message: "Unit detail retrieved successfully", ...detail, force, department: force, notes });
    } catch (error) {
        console.error("Get Unit Detail Error:", error);
        res.status(500).json({ message: "Failed to fetch unit detail" });
    }
}

async function addOrganizationalNoteController(req, res) {
    try {
        const force = await getForceForCommander(req.user.Id);
        const unitName = decodeURIComponent(req.params.unitName);
        const { note, actionType } = req.body;

        const created = await OrganizationalNote.create({
            force,
            unit: unitName,
            createdBy: req.user.Id,
            note,
            actionType
        });

        res.status(201).json({ message: "Organizational note added successfully", note: created });
    } catch (error) {
        console.error("Add Organizational Note Error:", error);
        res.status(500).json({ message: "Failed to add organizational note" });
    }
}

export default { getUnitsController, getUnitDetailController, addOrganizationalNoteController };

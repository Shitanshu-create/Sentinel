import { getRosterForOfficer, getPersonnelDetail } from "../services/welfareOfficer.service.js";
import WelfareNote from "../models/welfareNote.model.js";

async function getRosterController(req, res) {
    try {
        const roster = await getRosterForOfficer(req.user.Id);
        res.status(200).json({ message: "Roster retrieved successfully", roster });
    } catch (error) {
        console.error("Get Roster Error:", error);
        res.status(500).json({ message: "Failed to fetch roster" });
    }
}

async function getPersonnelDetailController(req, res) {
    try {
        const { id } = req.params;
        const detail = await getPersonnelDetail(id);

        if (!detail) {
            return res.status(404).json({ message: "Personnel not found" });
        }

        const notes = await WelfareNote.find({ personnelId: id }).sort({ createdAt: -1 });

        res.status(200).json({ message: "Personnel detail retrieved successfully", ...detail, notes });
    } catch (error) {
        console.error("Get Personnel Detail Error:", error);
        res.status(500).json({ message: "Failed to fetch personnel detail" });
    }
}

async function addWelfareNoteController(req, res) {
    try {
        const { id } = req.params; // personnelId
        const { note, actionType } = req.body;

        const created = await WelfareNote.create({
            personnelId: id,
            createdBy: req.user.Id,
            note,
            actionType
        });

        res.status(201).json({ message: "Welfare note added successfully", note: created });
    } catch (error) {
        console.error("Add Welfare Note Error:", error);
        res.status(500).json({ message: "Failed to add welfare note" });
    }
}

export default { getRosterController, getPersonnelDetailController, addWelfareNoteController };

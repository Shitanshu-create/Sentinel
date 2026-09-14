import {
    assignAssessment,
    submitAssessmentAnswers,
    getAssessmentsForOfficer,
    getAssessmentsForPersonnel
} from "../services/assessment.service.js";
import { ASSESSMENT_QUESTION_BANK } from "../constants/assessmentQuestions.js";

async function getQuestionBankController(req, res) {
    res.status(200).json({ message: "Question bank retrieved successfully", questions: ASSESSMENT_QUESTION_BANK });
}

async function assignAssessmentController(req, res) {
    try {
        const { id } = req.params; // personnelId
        const { questionIds } = req.body;

        const assessment = await assignAssessment(req.user.Id, id, questionIds);

        if (!assessment) {
            return res.status(403).json({ message: "This personnel is not within your assigned unit, or the selected questions are invalid" });
        }

        res.status(201).json({ message: "Assessment assigned successfully", assessment });
    } catch (error) {
        console.error("Assign Assessment Error:", error);
        res.status(500).json({ message: "Failed to assign assessment" });
    }
}

async function getOfficerAssessmentsController(req, res) {
    try {
        const assessments = await getAssessmentsForOfficer(req.user.Id);
        res.status(200).json({ message: "Assessments retrieved successfully", assessments });
    } catch (error) {
        console.error("Get Officer Assessments Error:", error);
        res.status(500).json({ message: "Failed to fetch assessments" });
    }
}

async function getMyAssessmentsController(req, res) {
    try {
        const assessments = await getAssessmentsForPersonnel(req.user.Id);
        res.status(200).json({ message: "Assessments retrieved successfully", assessments });
    } catch (error) {
        console.error("Get My Assessments Error:", error);
        res.status(500).json({ message: "Failed to fetch assessments" });
    }
}

async function submitAssessmentController(req, res) {
    try {
        const { assessmentId } = req.params;
        const { answers } = req.body;

        const result = await submitAssessmentAnswers(assessmentId, req.user.Id, answers);

        if (!result) {
            return res.status(404).json({ message: "Assessment not found" });
        }
        if (result.alreadyCompleted) {
            return res.status(409).json({ message: "This assessment has already been completed" });
        }

        res.status(200).json({ message: "Assessment submitted successfully", assessment: result.assessment });
    } catch (error) {
        console.error("Submit Assessment Error:", error);
        res.status(500).json({ message: "Failed to submit assessment" });
    }
}

export default {
    getQuestionBankController,
    assignAssessmentController,
    getOfficerAssessmentsController,
    getMyAssessmentsController,
    submitAssessmentController
};

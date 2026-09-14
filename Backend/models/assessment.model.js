import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
    personnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Personnel ID is required"],
        index: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Welfare officer ID is required"]
    },
    questions: [{
        questionId: { type: String, required: true },
        category: { type: String, required: true },
        text: { type: String, required: true }
    }],
    status: {
        type: String,
        enum: ["assigned", "completed"],
        default: "assigned",
        index: true
    },
    answers: [{
        questionId: { type: String, required: true },
        answerText: { type: String, required: true, trim: true, maxlength: 2000 }
    }],
    aiAnalysis: {
        summary: { type: String, default: null },
        contributingFactors: { type: [String], default: [] },
        suggestedAction: { type: String, default: null },
        concernLevel: { type: String, enum: ["low", "moderate", "elevated", "high", null], default: null }
    },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null }
}, { timestamps: true });

assessmentSchema.index({ personnelId: 1, status: 1, assignedAt: -1 });
assessmentSchema.index({ assignedBy: 1, assignedAt: -1 });

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;

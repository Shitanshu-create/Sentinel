import mongoose from 'mongoose';

const welfareNoteSchema = new mongoose.Schema({
    personnelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Personnel ID is required"],
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Welfare officer ID is required"]
    },
    actionType: {
        type: String,
        enum: ["confidential_check", "workload_review", "leave_review", "rest_recommendation", "counseling_referral", "general_note"],
        default: "general_note"
    },
    note: {
        type: String,
        required: [true, "Note content is required"],
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

welfareNoteSchema.index({ personnelId: 1, createdAt: -1 });

const WelfareNote = mongoose.model("WelfareNote", welfareNoteSchema);

export default WelfareNote;

import mongoose from 'mongoose';

const organizationalNoteSchema = new mongoose.Schema({
    department: {
        type: String,
        required: [true, "Department is required"],
        trim: true,
        index: true
    },
    unit: {
        type: String,
        required: [true, "Unit is required"],
        trim: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Commanding officer ID is required"]
    },
    actionType: {
        type: String,
        enum: ["workload_review", "staffing_review", "duty_schedule_review", "leave_policy_review", "recognition", "general_note"],
        default: "general_note"
    },
    note: {
        type: String,
        required: [true, "Note content is required"],
        trim: true,
        maxlength: 2000
    }
}, { timestamps: true });

organizationalNoteSchema.index({ department: 1, unit: 1, createdAt: -1 });

const OrganizationalNote = mongoose.model("OrganizationalNote", organizationalNoteSchema);

export default OrganizationalNote;

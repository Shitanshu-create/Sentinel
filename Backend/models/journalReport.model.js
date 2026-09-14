import mongoose from 'mongoose';


const geminiResponseSchema = new mongoose.Schema({
    calmness_score: {
        type: Number,
        required: [true, "Calmness score is required"]
    },
    anxious_score: {
        type: Number,
        required: [true, "Anxiety score is required"]
    },
    productivity_score: {
        type: Number,
        required: [true, "Productivity score is required"]
    },
    sadness_score: {
        type: Number,
        required: [true, "Sadness score is required"]
    },
    happiness_score: {
        type: Number,
        required: [true, "Happiness score is required"]
    },
    stress_score: {
        type: Number,
        default: 30
    },
    risk_level: {
        type: String,
        enum: ["normal", "elevated", "high", "critical"],
        default: "normal"
    }
});



const journalReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"]
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
        default: () => new Date()
    },
    chat: {
        type: String,
        required: [true, "Message is required"]
    },
    title:{
        type: String,
        required: [true, "title is required"]
    },
    reflection: {
        type: Array,
        required: [true, "Reflection is required"]
    },
    media: [{
        data: Buffer,
        contentType: String,
        filename: String
    }],
    isPrivate: {
        type: Boolean,
        default: false,
        index: true
    },
    sleepHours: {
        type: Number,
        min: 0,
        max: 24,
        default: null
    },

    gemini_response: {
        type: geminiResponseSchema,
        required: [true, "Gemini response is required"]
    }
}, {
    timestamps: true
});

journalReportSchema.index({ userId: 1, date: -1 });

const JournalReport = mongoose.model("JournalReport", journalReportSchema);

export default JournalReport;

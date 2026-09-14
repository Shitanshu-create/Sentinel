import mongoose from 'mongoose';

const userStatsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"],
        unique: true
    },
    totalEntries: {
        type: Number,
        default: 0
    },
    totalWords: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    avgMoodScore: {
        type: Number,
        default: 0
    },
    currentStressStatus: {
        type: Number,
        default: 0
    },
    wellnessRiskLevel: {
        type: String,
        enum: ["normal", "elevated", "high", "critical"],
        default: "normal"
    },
    avgSleepHours: {
        type: Number,
        default: null
    },
    lastEntryDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const UserStats = mongoose.model("UserStats", userStatsSchema);

export default UserStats;

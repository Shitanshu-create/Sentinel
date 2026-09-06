import mongoose from 'mongoose';

const insightsCacheSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    data: {
        type: Object, // Stores the observations, advices, themes
        required: true
    },
    lastGenerated: {
        type: Date,
        default: Date.now
    },
    privacyVersion: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// TTL Index could also be used, but since we check lastGenerated manualy 
// for exactly 24h flexibility, a standard collection works well.
const InsightsCache = mongoose.model('InsightsCache', insightsCacheSchema);

export default InsightsCache;

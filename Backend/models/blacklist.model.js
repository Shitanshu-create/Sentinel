import mongoose from "mongoose";

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true , "Token is required"], 
        unique: true
    },
}, { timestamps: true });

blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const tokenBlacklistModel = mongoose.model("TokenBlacklist", blacklistTokenSchema);

export default tokenBlacklistModel;




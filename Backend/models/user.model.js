import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Login Credentials
    username: { type: String, required: true, unique: [ true, "Username already exists" ] },
    email: { type: String, required: true, unique: [ true, "Email already exists" ] },
    passwordHash: { type: String, default: null },
    provider: { type: String, enum: ["local", "google", "github"], default: "local" },
    providerId: { type: String, default: null },

    // Role for system access control
    role: { type: String, enum: ["personnel", "welfare_officer", "commander", "admin"], default: "personnel" },

    // Personal Details
    personalDetails: {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        age: { type: Number, min: 18, max: 65 },
        gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
        phoneNo: { type: String, trim: true, maxlength: 15 }
    },

    // Service Details
    serviceDetails: {
        rank: { type: String, trim: true, maxlength: 60 },
        role: { type: String, trim: true, maxlength: 100 },
        unit: { type: String, trim: true, maxlength: 100 },
        department: { type: String, trim: true, maxlength: 100 }
    },

    // Current Status
    currentStatus: {
        postingLocation: { type: String, trim: true, maxlength: 150 },
        estimatedWorkHours: { type: Number, min: 0, max: 24 },
        lastLeaveDate: { type: Date, default: null },
        deploymentHistory: [{
            location: String,
            startDate: Date,
            endDate: Date
        }],
        dutySchedule: { type: String, trim: true, maxlength: 200 }
    }
}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import env from "../config/env.js";

async function seed() {
    await mongoose.connect(env.mongoUri);

    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

    const officer = await UserModel.create({
        username: "officer_demo",
        email: "officer.demo@sentinel.local",
        passwordHash,
        role: "welfare_officer",
        personalDetails: { name: "Demo Welfare Officer" },
        serviceDetails: { unit: "Alpha Unit", rank: "Welfare Officer", department: "Personnel Welfare" }
    });

    console.log("Welfare officer created:", officer.username, officer.email);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import UserModel from "../models/user.model.js";
import env from "../config/env.js";

async function seed() {
    await mongoose.connect(env.mongoUri);

    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);

    const existing = await UserModel.findOne({ username: "commander_demo" });
    if (existing) {
        console.log("Commander already exists:", existing.username);
        await mongoose.disconnect();
        return;
    }

    const commander = await UserModel.create({
        username: "commander_demo",
        email: "commander.demo@sentinel.local",
        passwordHash,
        role: "commander",
        personalDetails: { name: "Demo Commanding Officer" },
        serviceDetails: { rank: "Commandant", department: "Operations" }
    });

    console.log("Commanding officer created:", commander.username, commander.email);
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error(err);
    process.exit(1);
});

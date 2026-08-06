import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";
import "../src/config/env.js";


async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL,
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        await User.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: "admin",
        });

        console.log("🎉 Admin account created successfully.");
        console.log(`Email: ${process.env.ADMIN_EMAIL}`);
        console.log("Use the password from your .env file.");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeder failed:", error.message);

        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }

        process.exit(1);
    }
}

seedAdmin();
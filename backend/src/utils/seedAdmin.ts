import { User } from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

export const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("❌ ADMIN_EMAIL is not defined in .env file");
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log("ℹ️ Admin user already exists:", adminEmail);
    return;
  }

  const admin = new User({
    name: "Admin",
    email: adminEmail,
    password: process.env.ADMIN_PASSWORD || "admin@123",
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin user seeded:", adminEmail);
};

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";

try {
  await connectDB();
  const name = process.env.ADMIN_NAME || "Bondhu Admin";
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "";
  if (!email || password.length < 12) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters in server/.env");
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findOneAndUpdate({ email }, { name, email, passwordHash }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`Admin account ready: ${email}`);
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

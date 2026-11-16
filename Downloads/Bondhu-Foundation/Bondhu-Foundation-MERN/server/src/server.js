import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import printOrderRoutes from "./routes/printOrderRoutes.js";
import { protect } from "./middleware/auth.js";

const app = express();
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ],
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Bondhu Foundation API" }));
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/donors", protect, donorRoutes);
app.use("/api/print-orders", protect, printOrderRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid record ID." });
  res.status(500).json({ message: "Server error. Please try again." });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`Bondhu API running at http://localhost:${port}`)))
  .catch(error => { console.error("Database connection failed:", error.message); process.exit(1); });

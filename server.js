import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import redisClient from "./config/redis.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database connected successfully!",
      dbTime: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Database connection error." });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "Backend is running !!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

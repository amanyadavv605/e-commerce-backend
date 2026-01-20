import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "./config/redis.js";
import pool from "./config/db.js";

import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import authRoutes from "./routes/auth.routes.js";

import { requireAuth } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

app.get("/health/db", async (req, res) => {
  try {
    await pool.query("SELECT NOW()")
    res.json("Tested OK");
  }catch (err){
    console.error("Error : ", err);
    res.status(500);
  }
})

app.get("/api/protected", requireAuth, (req, res) => {
  res.send({
    message: "!---Access granted---!",
    user: req.user
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
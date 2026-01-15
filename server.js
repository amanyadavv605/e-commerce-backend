import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "./config/redis.js";

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

app.get("/api/protected", requireAuth, (req, res) => {
  res.send({
    message: "!---Access granted---!",
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
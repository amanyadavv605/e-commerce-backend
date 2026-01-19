import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import pool from "../config/db";
import express from "express";

const router = express.Router();

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Please fill required fields." });
  }

  const result = await pool.query(
    `INSERT INTO products (name, description, price, stock, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description, price, stock, category_id],
  );

  return res.status(201).json({ message: result.rows[0] })
});

export default router;

import express from "express";
import pool from "../config/db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, requireAdmin, async (req, res) => {
    const { name } = req.body;

    if(!name) {
        return res.status(400).json({ message: "Category name required!" });
    }

    const result = await pool.query(
        "INSERT INTO categories (name) VALUES ($1) RETURNING *",
        [name]
    );

    res.status(401).json(result.rows[0]);
});

router.get("/", async (req, res) => {
    const result = await pool.query("SELECT (name) FROM categories");

    res.status(200).json(result.rows);
})

export default router;
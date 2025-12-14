// routes/inventory.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const INVENTORY_URL = process.env.INVENTORY_API_URL; // http://localhost:5001/api

router.get("/search", async (req, res) => {
  const q = req.query.q || "";

  if (!INVENTORY_URL) {
    return res
      .status(500)
      .json({ message: "Inventory service not configured" });
  }

  try {
    const response = await axios.get(`${INVENTORY_URL}/parts/search`, {
      params: { q },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Inventory proxy error:", err.message);
    res.status(502).json({ message: "Inventory service unavailable" });
  }
});
console.log("Inventory URL:", INVENTORY_URL);

export default router;

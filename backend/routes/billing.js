import express from "express";
import axios from "axios";
import JobCard from "../models/JobCard.js";
import Bill from "../models/Bill.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

const INVENTORY_API = process.env.INVENTORY_API_URL; // http://localhost:5001/api

/**
 * CASHIER – Create or Reprint Bill
 */
router.post(
  "/create",
  requireAuth,
  requireRole("cashier"),
  async (req, res) => {
    try {
      const { jobCardId } = req.body;
      if (!jobCardId)
        return res.status(400).json({ message: "jobCardId required" });

      const job = await JobCard.findById(jobCardId);
      if (!job) return res.status(404).json({ message: "Job not found" });
      if (job.status !== "Done")
        return res.status(400).json({ message: "Job not completed" });

      // 🔁 Reprint (same bill ID)
      const existing = await Bill.findOne({ jobCard: job._id });
      if (existing) {
        existing.lastPrintedAt = new Date();
        existing.cashier = req.user._id;
        await existing.save();
        return res.json(existing);
      }

      const partsUsed = job.partsUsed || [];
      const serviceCharges = job.serviceCharges || [];

      if (!partsUsed.length && !serviceCharges.length) {
        return res.status(400).json({
          message: "No billable items (no parts or services)",
        });
      }

      let total = 0;
      const items = [];

      // 🔧 PARTS (optional)
      for (const pu of partsUsed) {
        const qty = Number(pu.qty || 0);
        if (!qty) continue;

        const unitPrice = Number(pu.priceAtUse || 0);
        const lineTotal = qty * unitPrice;

        total += lineTotal;

        items.push({
          partId: pu.partId,
          name: pu.name,
          qty,
          unitPrice,
          total: lineTotal,
        });
      }

      // 🛠 SERVICE CHARGES (optional)
      for (const sc of serviceCharges) {
        const amt = Number(sc.amount || 0);
        if (!amt) continue;

        total += amt;

        items.push({
          partId: null,
          name: sc.description || "Service Charge",
          qty: 1,
          unitPrice: amt,
          total: amt,
        });
      }

      const bill = await Bill.create({
        jobCard: job._id,
        items,
        total,
        cashier: req.user._id,
        lastPrintedAt: new Date(),
      });

      return res.status(201).json(bill);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
);

export default router;

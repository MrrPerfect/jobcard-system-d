import express from 'express';
import JobCard from '../models/JobCard.js';
import Bill from '../models/Bill.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { findPart, reservePart } from '../data/inventoryData.js';

const router = express.Router();

/**
 * Create bill for a jobcard (cashier)
 * body: { jobCardId, parts: [{ partId, qty }] }
 */
router.post('/create', requireAuth, requireRole('cashier'), async (req, res) => {
  try {
    const { jobCardId, parts } = req.body;
    if (!jobCardId || !Array.isArray(parts)) return res.status(400).json({ message: 'Invalid payload' });

    const job = await JobCard.findById(jobCardId);
    if (!job) return res.status(404).json({ message: 'Job card not found' });
    if (job.status !== 'Done') return res.status(400).json({ message: 'Job not completed' });

    const billParts = [];
    let total = 0;

    for (const p of parts) {
      const meta = findPart(p.partId);
      if (!meta) return res.status(400).json({ message: `Part ${p.partId} not found` });
      if (meta.stock < p.qty) return res.status(400).json({ message: `Insufficient stock for ${meta.name}` });
      const partTotal = meta.price * p.qty;
      billParts.push({
        partId: meta.id,
        name: meta.name,
        qty: p.qty,
        unitPrice: meta.price,
        total: partTotal
      });
    }

    // reserve/deduct stock
    for (const p of parts) {
      const ok = reservePart(p.partId, p.qty);
      if (!ok) return res.status(500).json({ message: 'Stock update failed' });
    }

    total = billParts.reduce((s, x) => s + x.total, 0);

    const bill = await Bill.create({
      jobCard: job._id,
      parts: billParts,
      total,
      cashier: req.user._id
    });

    return res.status(201).json(bill);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
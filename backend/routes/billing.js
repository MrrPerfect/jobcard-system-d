import express from 'express';
import JobCard from '../models/JobCard.js';
import Bill from '../models/Bill.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { findPart, reservePart } from '../data/inventoryData.js';

const router = express.Router();

/**
 * Create or re-print bill for a jobcard (cashier)
 * - Single Bill document per jobCard; prints increments on re-print.
 * - Returns the bill document (new or updated) with same _id for same job.
 */
router.post('/create', requireAuth, requireRole('cashier'), async (req, res) => {
  try {
    const { jobCardId, parts } = req.body;
    if (!jobCardId || !Array.isArray(parts)) return res.status(400).json({ message: 'Invalid payload' });

    const job = await JobCard.findById(jobCardId).populate('serviceCharges.addedBy');
    if (!job) return res.status(404).json({ message: 'Job card not found' });
    if (job.status !== 'Done') return res.status(400).json({ message: 'Job not completed' });

    // If bill exists for this job, increment prints and update lastPrintedAt/cashier atomically
    const existing = await Bill.findOne({ jobCard: job._id });
    if (existing) {
      existing.prints = (existing.prints || 1) + 1;
      existing.lastPrintedAt = new Date();
      existing.cashier = req.user._id;
      await existing.save();
      return res.json(existing);
    }

    // Build bill parts from requested parts array
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
      total += partTotal;
    }

    // reserve/deduct stock
    for (const p of parts) {
      const ok = reservePart(p.partId, p.qty);
      if (!ok) return res.status(500).json({ message: 'Stock update failed' });
    }

    // include service charges from job
    const svcCharges = (job.serviceCharges || []).map(sc => {
      const item = {
        partId: null,
        name: sc.description || 'Service charge',
        qty: 1,
        unitPrice: sc.amount || 0,
        total: sc.amount || 0
      };
      total += item.total;
      return item;
    });

    const allItems = billParts.concat(svcCharges);

    const bill = await Bill.create({
      jobCard: job._id,
      parts: allItems,
      total,
      cashier: req.user._id,
      prints: 1,
      lastPrintedAt: new Date()
    });

    return res.status(201).json(bill);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * Get bill info for a job (returns bill or 404 if none)
 */
router.get('/by-job/:jobId', requireAuth, requireRole('cashier'), async (req, res) => {
  try {
    const bill = await Bill.findOne({ jobCard: req.params.jobId });
    if (!bill) return res.status(404).json({ message: 'No bill for this job' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
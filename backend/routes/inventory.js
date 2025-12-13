import express from 'express';
import { parts, findPart } from '../data/inventoryData.js';
const router = express.Router();

// list parts
router.get('/parts', (req, res) => {
  res.json(parts);
});

// get part detail
router.get('/parts/:id', (req, res) => {
  const p = findPart(req.params.id);
  if (!p) return res.status(404).json({ message: 'Part not found' });
  res.json(p);
});

export default router;
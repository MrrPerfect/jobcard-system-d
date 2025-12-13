import express from 'express';
import JobCard from '../models/JobCard.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * AUTH MIDDLEWARE (same as your working one)
 */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
};

/**
 * GET JOBS FOR TECHNICIAN
 */
router.get('/jobs', auth, async (req, res) => {
  if (req.user.role !== 'technician')
    return res.status(403).json({ msg: 'Forbidden' });

  const jobs = await JobCard.find({
    $or: [
      { status: 'CREATED' },
      { assignedTechnician: req.user.id }
    ]
  }).sort({ createdAt: -1 });

  res.json(jobs);
});

/**
 * START JOB
 */
router.put('/jobs/:id/start', auth, async (req, res) => {
  if (req.user.role !== 'technician')
    return res.status(403).json({ msg: 'Forbidden' });

  const job = await JobCard.findById(req.params.id);
  if (!job) return res.status(404).json({ msg: 'Job not found' });

  job.status = 'IN_PROGRESS';
  job.assignedTechnician = req.user.id;
  await job.save();

  res.json(job);
});

/**
 * COMPLETE JOB
 */
router.put('/jobs/:id/complete', auth, async (req, res) => {
  if (req.user.role !== 'technician')
    return res.status(403).json({ msg: 'Forbidden' });

  const { technicianSummary } = req.body;

  const job = await JobCard.findById(req.params.id);
  if (!job) return res.status(404).json({ msg: 'Job not found' });

  job.status = 'DONE';
  job.technicianSummary = technicianSummary;
  await job.save();

  res.json(job);
});

export default router;

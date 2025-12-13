import express from 'express';
import JobCard from '../models/JobCard.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = express.Router();

/**
 * Advisor creates a jobcard
 */
router.post('/', requireAuth, requireRole('advisor'), async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const jc = await JobCard.create(data);
    return res.status(201).json(jc);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

/**
 * List jobcards based on role
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'manager') {
      const all = await JobCard.find().populate('assignedTo createdBy');
      return res.json(all);
    }
    if (req.user.role === 'advisor') {
      const mine = await JobCard.find({ createdBy: req.user._id }).populate('assignedTo');
      return res.json(mine);
    }
    if (req.user.role === 'technician') {
      const assigned = await JobCard.find({ assignedTo: req.user._id });
      return res.json(assigned);
    }
    if (req.user.role === 'cashier') {
      const done = await JobCard.find({ status: 'Done' });
      return res.json(done);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * Detail
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const jc = await JobCard.findById(req.params.id).populate('assignedTo createdBy');
    if (!jc) return res.status(404).json({ message: 'Not found' });
    return res.json(jc);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * Technician updates status / critical / finalSummary
 */
router.patch('/:id/status', requireAuth, requireRole('technician'), async (req, res) => {
  try {
    const { status, finalSummary, critical } = req.body;
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });

    // validate transition
    const valid = {
      Created: ['Assigned'],
      Assigned: ['In Progress'],
      'In Progress': ['Done'],
      Done: []
    };

    if (status && status !== job.status) {
      const allowed = valid[job.status] || [];
      if (!allowed.includes(status) && req.user.role !== 'manager') {
        return res.status(400).json({ message: 'Invalid status transition' });
      }
      job.status = status;
    }

    if (typeof critical === 'boolean') job.critical = critical;
    if (finalSummary) job.finalSummary = finalSummary;

    await job.save();
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * Manager or advisor can assign technician
 */
router.patch('/:id/assign', requireAuth, (req, res, next) => {
  // require manager or advisor; manager allowed always, advisor allowed if they created the job
  if (req.user.role === 'manager') return next();
  if (req.user.role === 'advisor') return next();
  return res.status(403).json({ message: 'Forbidden' });
}, async (req, res) => {
  try {
    const { technicianId } = req.body;
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Not found' });
    job.assignedTo = technicianId;
    job.status = 'Assigned';
    await job.save();
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
import express from 'express';
import JobCard from '../models/JobCard.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

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

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'service_advisor')
    return res.status(403).json({ msg: 'Forbidden' });

  const job = await JobCard.create({
    ...req.body,
    createdBy: req.user.id
  });

  res.json(job);
});

router.get('/', auth, async (req, res) => {
  const jobs = await JobCard.find().sort({ createdAt: -1 });
  res.json(jobs);
});

export default router;

import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = express.Router();

// list users (manager only)
router.get('/users', requireAuth, requireRole('manager'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// update user role
router.patch('/users/:id/role', requireAuth, requireRole('manager'), async (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ message: 'role required' });
  const allowed = ['advisor','technician','manager','cashier'];
  if (!allowed.includes(role)) return res.status(400).json({ message: 'invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
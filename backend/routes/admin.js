import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = express.Router();

// list users (manager only)
router.get('/users', requireAuth, requireRole('manager'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// update user role with safeguards
router.patch('/users/:id/role', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role required' });
    const allowed = ['advisor','technician','manager','cashier'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'invalid role' });

    const targetId = req.params.id;
    // prevent manager demoting themself
    if (req.user._id.toString() === targetId && role !== 'manager') {
      return res.status(400).json({ message: 'Managers cannot demote themselves' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    // prevent removing last manager
    if (target.role === 'manager' && role !== 'manager') {
      const managerCount = await User.countDocuments({ role: 'manager' });
      if (managerCount <= 1) {
        return res.status(400).json({ message: 'Cannot remove the last manager. Promote another user first.' });
      }
    }

    target.role = role;
    await target.save();
    const out = target.toObject();
    delete out.password;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
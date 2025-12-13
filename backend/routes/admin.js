import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const router = express.Router();

// list users (manager only) - mask unapproved users' details for general listing
router.get('/users', requireAuth, requireRole('manager'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users.map(u => {
    // keep full info in list because manager can view them; keep approved flag
    return u;
  }));
});

// list pending registrations (minimal info)
router.get('/users/pending', requireAuth, requireRole('manager'), async (req, res) => {
  const pending = await User.find({ approved: false }).select('name email role approved');
  res.json(pending);
});

// get single user - manager can view details even if not approved
router.get('/users/:id', requireAuth, requireRole('manager'), async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  // manager may view full details regardless of approved flag
  res.json(user);
});

// approve user
router.patch('/users/:id/approve', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.approved = true;
    await user.save();
    res.json({ message: 'User approved', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// change role with safeguards (existing logic kept)
router.patch('/users/:id/role', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role required' });
    const allowed = ['advisor','technician','manager','cashier'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'invalid role' });

    const targetId = req.params.id;
    if (req.user._id.toString() === targetId && role !== 'manager') {
      return res.status(400).json({ message: 'Managers cannot demote themselves' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

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

// delete user (manager only)
router.delete('/users/:id', requireAuth, requireRole('manager'), async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
const router = express.Router();

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.status(400).json({ msg: "Invalid" });
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({ msg: "Invalid" });

  const token = jwt.sign({ id:user._id, role:user.role }, process.env.JWT_SECRET);
  res.json({ token, role:user.role });
});

export default router;

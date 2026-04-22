import express from 'express';
import User from '../models/User.js';
import Question from '../models/Question.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, admin, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

router.put('/:id/block', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json(user);
});

router.put('/:id/role', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id);
  user.role = user.role === 'admin' ? 'user' : 'admin';
  await user.save();
  res.json(user);
});

router.delete('/:id', protect, admin, async (req, res) => {
  await Question.deleteMany({ user: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
import express from 'express';
import Question from '../models/Question.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Ask question (logged in users)
router.post('/', protect, async (req, res) => {
  try {
    const { question, category, language } = req.body;
    const q = await Question.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      question,
      category,
      language,
    });
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public: Get answered questions
router.get('/public', async (req, res) => {
  try {
    const questions = await Question.find({
      status: 'answered',
      isPublic: true,
    })
      .sort({ answeredAt: -1 })
      .limit(20);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User: Get my questions
router.get('/my', protect, async (req, res) => {
  const questions = await Question.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(questions);
});

// Admin: Get all questions
router.get('/', protect, admin, async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
});

// Admin: Answer question
router.put('/:id/answer', protect, admin, async (req, res) => {
  try {
    const { answer, isPublic } = req.body;
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      {
        answer,
        status: 'answered',
        answeredBy: req.user._id,
        answeredAt: new Date(),
        isPublic: isPublic !== undefined ? isPublic : true,
      },
      { new: true }
    );
    res.json(q);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete
router.delete('/:id', protect, admin, async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
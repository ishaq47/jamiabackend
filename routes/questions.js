import express from 'express';
import Question from '../models/Question.js';
import { protect, admin } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { question, category, language, userName, userEmail } = req.body;

    // Basic validation
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'Question must be at least 5 characters long' });
    }

    let userId = null;
    let finalUserName = userName;
    let finalUserEmail = userEmail;

    // If user is logged in (via protect middleware)
    if (req.user) {
      userId = req.user._id;
      finalUserName = req.user.name;      // Prefer authenticated user's name
      finalUserEmail = req.user.email;    // Prefer authenticated user's email
    } 
    // If user is NOT logged in (Guest)
    else {
      if (!userName || userName.trim().length < 2) {
        return res.status(400).json({ error: 'Name is required for guest users' });
      }
      if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail)) {
        return res.status(400).json({ error: 'Valid email is required for guest users' });
      }
      finalUserName = userName.trim();
      finalUserEmail = userEmail.trim().toLowerCase();
    }

    const newQuestion = await Question.create({
      user: userId,                    // null if guest
      userName: finalUserName,
      userEmail: finalUserEmail,
      question: question.trim(),
      category: category || 'general',
      language: language || 'en',
      status: 'pending',               // Good to explicitly set status
      isPublic: false,                 // Default: not public until admin approves
    });

    res.status(201).json({
      message: 'Question submitted successfully',
      question: newQuestion
    });

  } catch (err) {
    console.error('Question creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;

    const filter = { status: 'answered', isPublic: true };
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Question.countDocuments(filter);
    const questions = await Question.find(filter)
      .sort({ answeredAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ questions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', protect, admin, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

    if (q && q.userEmail) {
      sendEmail({
        to: q.userEmail,
        subject: 'Your Question Has Been Answered',
        html: `
          <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <div style="background: #1e293b; color: white; padding: 20px; text-align: center;">
              <h2>Jamia Uloom Islamia</h2>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Assalamu Alaikum <strong>${q.userName}</strong>,</p>
              <p>Your question has been answered by our scholars.</p>
              <p><a href="${process.env.CLIENT_URL}/dashboard" style="background:#1e293b;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Answer</a></p>
            </div>
          </div>
        `,
      });
    }

    res.json(q);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
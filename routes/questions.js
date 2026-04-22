import express from 'express';
import Question from '../models/Question.js';
import { protect, admin } from '../middleware/auth.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { question, category, language } = req.body;
    const q = await Question.create({
      user: req.user._id,
      userName: req.user.username,
      userEmail: req.user.email,
      question,
      category: category || 'general',
      language: language || 'en',
    });
    res.status(201).json(q);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Public with pagination & filters
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
  const questions = await Question.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(questions);
});

router.get('/', protect, admin, async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
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

    // Email notification
    if (q.userEmail) {
      sendEmail({
        to: q.userEmail,
        subject: 'Your Question Has Been Answered',
        html: `
          <div style="font-family: Arial; max-width: 600px; margin: auto;">
            <div style="background: #14532d; color: white; padding: 20px; text-align: center;">
              <h2>Jamia Uloom Islamia</h2>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <p>Assalamu Alaikum <strong>${q.userName}</strong>,</p>
              <p>Your question has been answered by our scholars:</p>
              <div style="background: white; padding: 15px; border-left: 4px solid #14532d; margin: 15px 0;">
                <strong>Q:</strong> ${q.question}
              </div>
              <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #eab308;">
                <strong>A:</strong> ${answer.replace(/<[^>]*>/g, '').substring(0, 300)}...
              </div>
              <p style="margin-top: 20px;">
                <a href="${process.env.CLIENT_URL}/dashboard" style="background:#14532d;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">View Full Answer</a>
              </p>
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
  await Question.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
import express from 'express';
import News from '../models/News.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const news = await News.find().sort({ createdAt: -1 });
    const formatted = news.map((n) => ({
      _id: n._id,
      title: n.title[lang] || n.title.en,
      description: n.description[lang] || n.description.en,
      image: n.image,
      createdAt: n.createdAt,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', protect, admin, async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  const news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(news);
});

router.delete('/:id', protect, admin, async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
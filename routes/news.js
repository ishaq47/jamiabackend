import express from 'express';
import News from '../models/News.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Public with pagination
router.get('/', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const total = await News.countDocuments();
    const news = await News.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    const formatted = news.map((n) => ({
      _id: n._id,
      title: n.title[lang] || n.title.en,
      description: n.description[lang] || n.description.en,
      image: n.image,
      createdAt: n.createdAt,
    }));

    res.json({
      news: formatted,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const n = await News.findById(req.params.id);
    if (!n) return res.status(404).json({ error: 'Not found' });
    res.json({
      _id: n._id,
      title: n.title[lang] || n.title.en,
      description: n.description[lang] || n.description.en,
      image: n.image,
      createdAt: n.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/all', protect, admin, async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
});

// Upload + create
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const data = {
      title: JSON.parse(req.body.title),
      description: JSON.parse(req.body.description),
    };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    else if (req.body.image) data.image = req.body.image;
    const news = await News.create(data);
    res.status(201).json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const data = {
      title: JSON.parse(req.body.title),
      description: JSON.parse(req.body.description),
    };
    if (req.file) {
      const old = await News.findById(req.params.id);
      if (old?.image?.startsWith('/uploads/')) {
        const oldPath = path.join('.', old.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      data.image = req.body.image;
    }
    const news = await News.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(news);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  const n = await News.findById(req.params.id);
  if (n?.image?.startsWith('/uploads/')) {
    const filePath = path.join('.', n.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await News.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
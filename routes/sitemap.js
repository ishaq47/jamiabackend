import express from 'express';
import Question from '../models/Question.js';
import News from '../models/News.js';

const router = express.Router();
const SITE_URL = process.env.CLIENT_URL || 'https://yourdomain.com';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const questions = await Question.find({ status: 'answered', isPublic: true }).select('_id updatedAt');
    const news = await News.find().select('_id updatedAt');

    const staticPages = [
      { loc: '/', priority: 1.0, freq: 'daily' },
      { loc: '/about', priority: 0.8, freq: 'monthly' },
      { loc: '/qa', priority: 0.9, freq: 'daily' },
      { loc: '/fatawa', priority: 0.9, freq: 'daily' },
      { loc: '/news', priority: 0.8, freq: 'weekly' },
      { loc: '/departments', priority: 0.7, freq: 'monthly' },
      { loc: '/admissions', priority: 0.9, freq: 'monthly' },
      { loc: '/admissions/apply', priority: 0.9, freq: 'monthly' },
      { loc: '/contact', priority: 0.6, freq: 'yearly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    staticPages.forEach((p) => {
      xml += `  <url>\n    <loc>${SITE_URL}${p.loc}</loc>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    questions.forEach((q) => {
      xml += `  <url>\n    <loc>${SITE_URL}/qa/${q._id}</loc>\n    <lastmod>${q.updatedAt.toISOString()}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
    });

    news.forEach((n) => {
      xml += `  <url>\n    <loc>${SITE_URL}/news/${n._id}</loc>\n    <lastmod>${n.updatedAt.toISOString()}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
    });

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import newsRoutes from './routes/news.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import userRoutes from './routes/users.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Madrasa API Running'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server on port ${process.env.PORT}`)
    );
  })
  .catch(console.error);
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import newsRoutes from './routes/news.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => res.send('Madrasa API Running'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error(err));
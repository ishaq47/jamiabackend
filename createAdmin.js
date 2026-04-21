import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteOne({ email: 'admin@madrasa.com' });
  await User.create({
    username: 'Admin123',
    email: 'admin1@madrasa.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('✅ Admin created: admin@madrasa.com / admin123');
  process.exit();
});
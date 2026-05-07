import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteOne({ email: 'admin@madrasa.com' });
  await User.create({
    username: 'Mufti Fazal Ali Shah',
    email: 'mufti123@gmail.com',
    password: 'mufti123',
    role: 'admin',
  });
  console.log('✅ Admin created: mik9649820@gmail.com / ishaq123');
  process.exit();
});
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.deleteOne({ email: 'admin@madrasa.com' });
  await User.create({
    username: 'Admin',
    email: 'mik9649820@gmail.com',
    password: 'ishaq123',
    role: 'admin',
  });
  console.log('✅ Admin created: mik9649820@gmail.com / ishaq123');
  process.exit();
});
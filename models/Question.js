import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    userName: String,
    userEmail: String,
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'answered'],
      default: 'pending',
    },
    category: {
      type: String,
      enum: ['general', 'fiqh', 'aqeedah', 'hadith', 'tafseer', 'seerah', 'family'],
      default: 'general',
    },
    language: { type: String, default: 'en' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answeredAt: Date,
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: { en: String, ur: String, ar: String },
    description: { en: String, ur: String, ar: String },
    image: String,
    category: String,
  },
  { timestamps: true }
);

export default mongoose.model('News', newsSchema);
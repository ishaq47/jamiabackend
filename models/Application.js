import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    cnic: String,
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    nationality: String,
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: String,
    country: String,
    department: { type: String, required: true },
    previousEducation: String,
    previousInstitute: String,
    quranMemorization: String,
    languagesKnown: String,
    motivationLetter: String,
    documentUrl: String,
    photoUrl: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
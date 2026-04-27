import express from 'express';
import Application from '../models/Application.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { sendEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.post('/', upload.fields([{ name: 'document', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.document) data.documentUrl = `/uploads/${req.files.document[0].filename}`;
    if (req.files?.photo) data.photoUrl = `/uploads/${req.files.photo[0].filename}`;
    
    const application = await Application.create(data);

    sendEmail({
      to: data.email,
      subject: 'Application Received - Jamia Uloom Islamia',
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#0f172a;">Application Received</h2>
          <p>Dear ${data.fullName},</p>
          <p>Thank you for applying to Jamia Uloom Islamia. We have received your application and will review it shortly.</p>
          <p><strong>Application ID:</strong> ${application._id}</p>
          <p>You will receive an update via email once your application is reviewed.</p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Application submitted', id: application._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', protect, admin, async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
});

router.get('/my', protect, async (req, res) => {
  const apps = await Application.find({ email: req.user.email }).sort({ createdAt: -1 });
  res.json(apps);
});

router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );

    sendEmail({
      to: app.email,
      subject: `Application ${status === 'approved' ? 'Approved' : 'Update'} - Jamia Uloom Islamia`,
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
          <h2 style="color:#0f172a;">Application ${status === 'approved' ? 'Approved 🎉' : status === 'rejected' ? 'Update' : 'Status'}</h2>
          <p>Dear ${app.fullName},</p>
          <p>Your application status: <strong>${status.toUpperCase()}</strong></p>
          ${adminNote ? `<p><strong>Note:</strong> ${adminNote}</p>` : ''}
        </div>
      `,
    });

    res.json(app);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
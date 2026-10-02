import { Router } from 'express';
import { ContactMessage } from '../../../models/ContactMessage.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// POST /api/contact - Public contact submission saved to MongoDB
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Name, email, subject, and message are required' });
      return;
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'unread' as const,
    };

    const created = await ContactMessage.create(payload);
    res.status(201).json({
      message: 'Your message has been sent to our support team.',
      contactMessage: created,
    });
  } catch (error) {
    console.error('[API Error] POST /api/contact failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/contact/admin/all - Get all messages from MongoDB
router.get('/admin/all', requireAdmin, async (_req, res) => {
  try {
    await connectToDatabase();
    const docs = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    res.json({ contactMessages: docs, total: docs.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/contact/admin/all failed:', error);
    res.status(500).json({ error: 'Failed to retrieve messages from MongoDB' });
  }
});

// Admin: PATCH /api/contact/:id/read - Mark message read in MongoDB
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;
    const doc = await ContactMessage.findByIdAndUpdate(id, { $set: { status: 'read' } }, { new: true });
    if (!doc) {
      res.status(404).json({ error: 'Message not found in MongoDB' });
      return;
    }
    res.json({ message: 'Marked as read', contactMessage: doc });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

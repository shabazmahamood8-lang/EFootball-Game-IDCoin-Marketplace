import { Router } from 'express';
import { ContactMessage } from '../../../models/ContactMessage.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';

const router = Router();

// POST /api/contact - Public contact submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Name, email, subject, and message are required' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: 'unread' as const,
    };

    if (usingMongo) {
      const created = await ContactMessage.create(payload);
      res.status(201).json({
        message: 'Your message has been sent to our support team.',
        contactMessage: created,
      });
      return;
    }

    const db = getDatabase();
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.unshift(newMsg);
    saveDatabase(db);

    res.status(201).json({
      message: 'Your message has been sent to our support team.',
      contactMessage: newMsg,
    });
  } catch (error) {
    console.error('[API Error] POST /api/contact failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/contact/admin/all
router.get('/admin/all', requireAdmin, async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const docs = await ContactMessage.find().sort({ createdAt: -1 }).lean();
      res.json({ contactMessages: docs, total: docs.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    res.json({ contactMessages: db.contactMessages, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/contact/admin/all failed:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Admin: PATCH /api/contact/:id/read
router.patch('/:id/read', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const doc = await ContactMessage.findByIdAndUpdate(
        id,
        { $set: { status: 'read' } },
        { new: true }
      );
      res.json({ message: 'Marked as read', contactMessage: doc });
      return;
    }

    const db = getDatabase();
    const msg = db.contactMessages.find((m) => m.id === id);
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }
    msg.status = 'read';
    saveDatabase(db);
    res.json({ message: 'Marked as read', contactMessage: msg });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

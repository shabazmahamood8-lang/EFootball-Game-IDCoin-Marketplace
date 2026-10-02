import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { requireAdmin } from '../auth.js';
import { IContactMessage } from '../models/types.js';

const router = Router();

// POST /api/contact - Public contact submission
router.post('/', (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Name, email, subject, and message are required' });
      return;
    }

    const db = getDatabase();
    const newMsg: IContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    db.contactMessages.unshift(newMsg);
    saveDatabase(db);

    res.status(201).json({ message: 'Your message has been sent to our support team.', contactMessage: newMsg });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/contact/admin/all
router.get('/admin/all', requireAdmin, (_req, res) => {
  const db = getDatabase();
  res.json({ contactMessages: db.contactMessages });
});

// Admin: PATCH /api/contact/:id/read
router.patch('/:id/read', requireAdmin, (req, res) => {
  const db = getDatabase();
  const msg = db.contactMessages.find((m) => m.id === req.params.id);

  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  msg.status = 'read';
  saveDatabase(db);

  res.json({ message: 'Marked as read', contactMessage: msg });
});

export default router;

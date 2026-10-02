import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

// GET /api/settings - Public
router.get('/', (_req, res) => {
  const db = getDatabase();
  res.json({ settings: db.settings });
});

// Admin: PUT /api/settings
router.put('/', requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDatabase(db);
    res.json({ message: 'Settings updated successfully', settings: db.settings });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

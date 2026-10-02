import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { requireAdmin } from '../auth.js';
import { ICoinPackage } from '../models/types.js';

const router = Router();

// GET /api/coins
router.get('/', (_req, res) => {
  const db = getDatabase();
  res.json({ coinPackages: db.coinPackages });
});

// GET /api/coins/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const pkg = db.coinPackages.find((p) => p.id === req.params.id);

  if (!pkg) {
    res.status(404).json({ error: 'Coin package not found' });
    return;
  }

  res.json({ coinPackage: pkg });
});

// Admin: POST /api/coins
router.post('/', requireAdmin, (req, res) => {
  try {
    const { coinAmount, price, originalPrice, discount, game, platform, deliveryInfo, status } = req.body;

    if (!coinAmount || !price) {
      res.status(400).json({ error: 'Coin amount and price are required' });
      return;
    }

    const db = getDatabase();
    const newPackage: ICoinPackage = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      coinAmount: Number(coinAmount),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      discount: discount ? Number(discount) : 0,
      game: game || 'eFootball 2026',
      platform: platform || 'All Platforms (Mobile / PC / Console)',
      deliveryInfo: deliveryInfo || 'Instant safe top-up via Player ID. 10 - 20 minutes delivery.',
      status: status === 'inactive' ? 'inactive' : 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.coinPackages.push(newPackage);
    saveDatabase(db);

    res.status(201).json({ message: 'Coin package created successfully', coinPackage: newPackage });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/coins/:id
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const index = db.coinPackages.findIndex((p) => p.id === req.params.id);

    if (index === -1) {
      res.status(404).json({ error: 'Coin package not found' });
      return;
    }

    const existing = db.coinPackages[index];
    const updated: ICoinPackage = {
      ...existing,
      ...req.body,
      coinAmount: req.body.coinAmount !== undefined ? Number(req.body.coinAmount) : existing.coinAmount,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : existing.originalPrice,
      discount: req.body.discount !== undefined ? Number(req.body.discount) : existing.discount,
      updatedAt: new Date().toISOString(),
    };

    db.coinPackages[index] = updated;
    saveDatabase(db);

    res.json({ message: 'Coin package updated successfully', coinPackage: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/coins/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const index = db.coinPackages.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Coin package not found' });
    return;
  }

  db.coinPackages.splice(index, 1);
  saveDatabase(db);

  res.json({ message: 'Coin package deleted successfully' });
});

export default router;

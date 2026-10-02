import { Router } from 'express';
import mongoose from 'mongoose';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';
import { ICoinPackage } from '../models/types.js';

const router = Router();

function formatCoinDoc(doc: any): ICoinPackage {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    coinAmount: Number(obj.coinAmount) || 0,
    price: Number(obj.price) || 0,
    originalPrice: Number(obj.originalPrice) || Number(obj.price) || 0,
    discount: Number(obj.discount) || 0,
    status: obj.status === 'inactive' ? 'inactive' : 'active',
  };
}

// GET /api/coins
router.get('/', async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const docs = await CoinPackage.find().sort({ coinAmount: 1 }).lean();
      const formatted = docs.map(formatCoinDoc);
      res.json({ coinPackages: formatted, total: formatted.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    res.json({
      coinPackages: db.coinPackages.map(formatCoinDoc),
      total: db.coinPackages.length,
      source: 'local',
    });
  } catch (error) {
    console.error('[API Error] GET /api/coins failed:', error);
    res.status(500).json({ error: 'Failed to retrieve coin packages from database' });
  }
});

// GET /api/coins/:id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await CoinPackage.findById(id).lean();
      }
      if (!doc) {
        doc = await CoinPackage.findOne({ $or: [{ _id: id }, { id }] }).lean();
      }

      if (!doc) {
        res.status(404).json({ error: 'Coin package not found' });
        return;
      }

      res.json({ coinPackage: formatCoinDoc(doc) });
      return;
    }

    const db = getDatabase();
    const pkg = db.coinPackages.find((p) => p.id === id);

    if (!pkg) {
      res.status(404).json({ error: 'Coin package not found' });
      return;
    }

    res.json({ coinPackage: formatCoinDoc(pkg) });
  } catch (error) {
    console.error('[API Error] GET /api/coins/:id failed:', error);
    res.status(500).json({ error: 'Failed to retrieve coin package' });
  }
});

// Admin: POST /api/coins
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { coinAmount, price, originalPrice, discount, game, platform, deliveryInfo, status } = req.body;

    if (!coinAmount || price === undefined) {
      res.status(400).json({ error: 'Coin amount and price are required' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const payload = {
      coinAmount: Number(coinAmount),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      discount: discount ? Number(discount) : 0,
      game: game || 'eFootball 2026',
      platform: platform || 'All Platforms (Mobile / PC / Console)',
      deliveryInfo: deliveryInfo || 'Instant safe top-up via Player ID. 10 - 20 minutes delivery.',
      status: (status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    };

    if (usingMongo) {
      const created = await CoinPackage.create(payload);
      res.status(201).json({ message: 'Coin package created in MongoDB', coinPackage: formatCoinDoc(created) });
      return;
    }

    const db = getDatabase();
    const newPackage: ICoinPackage = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.coinPackages.push(newPackage);
    saveDatabase(db);

    res.status(201).json({ message: 'Coin package created successfully', coinPackage: newPackage });
  } catch (error) {
    console.error('[API Error] POST /api/coins failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/coins/:id
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let updatedDoc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updatedDoc = await CoinPackage.findByIdAndUpdate(id, { $set: req.body }, { new: true }).lean();
      }
      if (!updatedDoc) {
        updatedDoc = await CoinPackage.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $set: req.body }, { new: true }).lean();
      }

      if (!updatedDoc) {
        res.status(404).json({ error: 'Coin package not found' });
        return;
      }

      res.json({ message: 'Coin package updated in MongoDB', coinPackage: formatCoinDoc(updatedDoc) });
      return;
    }

    const db = getDatabase();
    const index = db.coinPackages.findIndex((p) => p.id === id);

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
    console.error('[API Error] PUT /api/coins/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/coins/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await CoinPackage.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await CoinPackage.findOneAndDelete({ $or: [{ _id: id }, { id }] });
      }

      if (!deleted) {
        res.status(404).json({ error: 'Coin package not found in MongoDB' });
        return;
      }

      res.json({ message: 'Coin package deleted from MongoDB' });
      return;
    }

    const db = getDatabase();
    const index = db.coinPackages.findIndex((p) => p.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Coin package not found' });
      return;
    }

    db.coinPackages.splice(index, 1);
    saveDatabase(db);

    res.json({ message: 'Coin package deleted successfully' });
  } catch (error) {
    console.error('[API Error] DELETE /api/coins/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

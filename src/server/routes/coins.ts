import { Router } from 'express';
import mongoose from 'mongoose';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
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

// GET /api/coins - Retrieve coin packages from MongoDB
router.get('/', async (_req, res) => {
  try {
    await connectToDatabase();
    const docs = await CoinPackage.find().sort({ coinAmount: 1 }).lean();
    const formatted = docs.map(formatCoinDoc);
    res.json({ coinPackages: formatted, total: formatted.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/coins failed:', error);
    res.status(500).json({
      error: (error as Error).message || 'Failed to retrieve coin packages from database',
      details: (error as Error).message,
    });
  }
});

// GET /api/coins/:id - Single coin package from MongoDB
router.get('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await CoinPackage.findById(id).lean();
    }
    if (!doc) {
      doc = await CoinPackage.findOne({ $or: [{ _id: id }, { id }] }).lean();
    }

    if (!doc) {
      res.status(404).json({ error: 'Coin package not found in MongoDB' });
      return;
    }

    res.json({ coinPackage: formatCoinDoc(doc) });
  } catch (error) {
    console.error('[API Error] GET /api/coins/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: POST /api/coins - Create new coin package in MongoDB
router.post('/', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const { coinAmount, price, originalPrice, discount, game, platform, deliveryInfo, status } = req.body;

    if (!coinAmount || price === undefined) {
      res.status(400).json({ error: 'Coin amount and price are required' });
      return;
    }

    const payload = {
      coinAmount: Number(coinAmount),
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      discount: Number(discount || 0),
      game: game || 'eFootball 2026',
      platform: platform || 'All Platforms (Mobile / PC / Console)',
      deliveryInfo: deliveryInfo || 'Instant safe top-up via Player ID. 10 - 20 mins delivery.',
      status: (status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    };

    const created = await CoinPackage.create(payload);
    res.status(201).json({ message: 'Coin package created in MongoDB', coinPackage: formatCoinDoc(created) });
  } catch (error) {
    console.error('[API Error] POST /api/coins failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/coins/:id - Update coin package in MongoDB
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let updatedDoc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedDoc = await CoinPackage.findByIdAndUpdate(id, { $set: req.body }, { new: true }).lean();
    }
    if (!updatedDoc) {
      updatedDoc = await CoinPackage.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: req.body },
        { new: true }
      ).lean();
    }

    if (!updatedDoc) {
      res.status(404).json({ error: 'Coin package not found in MongoDB' });
      return;
    }

    res.json({ message: 'Coin package updated in MongoDB', coinPackage: formatCoinDoc(updatedDoc) });
  } catch (error) {
    console.error('[API Error] PUT /api/coins/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/coins/:id - Remove coin package from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

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
  } catch (error) {
    console.error('[API Error] DELETE /api/coins/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

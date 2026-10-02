import { Router } from 'express';
import mongoose from 'mongoose';
import { Review } from '../../../models/Review.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';
import { IReview } from '../models/types.js';

const router = Router();

function formatReviewDoc(doc: any): IReview {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    rating: Number(obj.rating) || 5,
  };
}

// GET /api/reviews - Approved reviews from database
router.get('/', async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const docs = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).lean();
      res.json({ reviews: docs.map(formatReviewDoc), total: docs.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    const approved = db.reviews.filter((r) => r.status === 'approved');
    res.json({ reviews: approved.map(formatReviewDoc), total: approved.length, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/reviews failed:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews from database' });
  }
});

// POST /api/reviews - Authenticated customer writes a review
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { product, orderId, rating, comment } = req.body;

    if (!product || !rating || !comment) {
      res.status(400).json({ error: 'Product, rating, and comment are required' });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const payload = {
      userId: req.user!.id,
      user: req.user!.id,
      userName: req.user!.name,
      product: String(product).trim(),
      orderId: orderId || '',
      rating: numRating,
      comment: String(comment).trim(),
      status: 'approved' as const,
    };

    if (usingMongo) {
      const created = await Review.create(payload);
      res.status(201).json({ message: 'Review submitted to MongoDB', review: formatReviewDoc(created) });
      return;
    }

    const db = getDatabase();
    const newReview: IReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    saveDatabase(db);

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    console.error('[API Error] POST /api/reviews failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/reviews/admin/all
router.get('/admin/all', requireAdmin, async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const docs = await Review.find().sort({ createdAt: -1 }).lean();
      res.json({ reviews: docs.map(formatReviewDoc), total: docs.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    res.json({ reviews: db.reviews.map(formatReviewDoc), total: db.reviews.length, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/reviews/admin/all failed:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews' });
  }
});

// Admin: PATCH /api/reviews/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!['approved', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Status must be approved or pending' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await Review.findByIdAndUpdate(id, { $set: { status } }, { new: true });
      }
      if (!doc) {
        doc = await Review.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $set: { status } }, { new: true });
      }
      if (!doc) {
        res.status(404).json({ error: 'Review not found in MongoDB' });
        return;
      }
      res.json({ message: 'Review status updated in MongoDB', review: formatReviewDoc(doc) });
      return;
    }

    const db = getDatabase();
    const review = db.reviews.find((r) => r.id === id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    review.status = status;
    saveDatabase(db);
    res.json({ message: 'Review status updated', review });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, async (req, res) => {
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
        doc = await Review.findByIdAndDelete(id);
      }
      if (!doc) {
        doc = await Review.findOneAndDelete({ $or: [{ _id: id }, { id }] });
      }
      if (!doc) {
        res.status(404).json({ error: 'Review not found in MongoDB' });
        return;
      }
      res.json({ message: 'Review deleted from MongoDB' });
      return;
    }

    const db = getDatabase();
    const index = db.reviews.findIndex((r) => r.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    db.reviews.splice(index, 1);
    saveDatabase(db);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

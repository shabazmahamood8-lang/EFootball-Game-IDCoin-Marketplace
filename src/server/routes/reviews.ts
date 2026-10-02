import { Router } from 'express';
import mongoose from 'mongoose';
import { Review } from '../../../models/Review.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
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

// GET /api/reviews - Approved reviews directly from MongoDB
router.get('/', async (_req, res) => {
  try {
    await connectToDatabase();
    const docs = await Review.find({ status: 'approved' }).sort({ createdAt: -1 }).lean();
    res.json({ reviews: docs.map(formatReviewDoc), total: docs.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/reviews failed:', error);
    res.status(500).json({
      error: (error as Error).message || 'Failed to retrieve reviews from database',
      details: (error as Error).message,
    });
  }
});

// POST /api/reviews - Authenticated customer writes a review in MongoDB
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
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

    const created = await Review.create(payload);
    res.status(201).json({ message: 'Review submitted to MongoDB', review: formatReviewDoc(created) });
  } catch (error) {
    console.error('[API Error] POST /api/reviews failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/reviews/admin/all - All reviews for admin review
router.get('/admin/all', requireAdmin, async (_req, res) => {
  try {
    await connectToDatabase();
    const docs = await Review.find().sort({ createdAt: -1 }).lean();
    res.json({ reviews: docs.map(formatReviewDoc), total: docs.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/reviews/admin/all failed:', error);
    res.status(500).json({ error: 'Failed to retrieve reviews from MongoDB' });
  }
});

// Admin: PATCH /api/reviews/:id/status - Approve or moderate review
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;
    const { status } = req.body;
    if (!['approved', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Status must be approved or pending' });
      return;
    }

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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Review.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Review.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    }

    if (!deleted) {
      res.status(404).json({ error: 'Review not found in MongoDB' });
      return;
    }

    res.json({ message: 'Review deleted from MongoDB' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

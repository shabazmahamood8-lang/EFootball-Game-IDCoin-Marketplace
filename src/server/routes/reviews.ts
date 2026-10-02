import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { IReview } from '../models/types.js';

const router = Router();

// GET /api/reviews - Approved reviews for public display
router.get('/', (_req, res) => {
  const db = getDatabase();
  const approved = db.reviews.filter((r) => r.status === 'approved');
  res.json({ reviews: approved });
});

// POST /api/reviews - Authenticated customer writes a review
router.post('/', authenticate, (req: AuthRequest, res) => {
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

    const db = getDatabase();
    const newReview: IReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user!.id,
      userName: req.user!.name,
      product,
      orderId,
      rating: numRating,
      comment,
      status: 'approved', // Auto-approved or pending based on admin preference
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    saveDatabase(db);

    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/reviews/admin/all
router.get('/admin/all', requireAdmin, (_req, res) => {
  const db = getDatabase();
  res.json({ reviews: db.reviews });
});

// Admin: PATCH /api/reviews/:id/status
router.patch('/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!['approved', 'pending'].includes(status)) {
    res.status(400).json({ error: 'Status must be approved or pending' });
    return;
  }

  const db = getDatabase();
  const review = db.reviews.find((r) => r.id === req.params.id);

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  review.status = status;
  saveDatabase(db);

  res.json({ message: 'Review status updated', review });
});

// Admin: DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const index = db.reviews.findIndex((r) => r.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  db.reviews.splice(index, 1);
  saveDatabase(db);

  res.json({ message: 'Review deleted successfully' });
});

export default router;

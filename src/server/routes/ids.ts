import { Router } from 'express';
import mongoose from 'mongoose';
import { FootballID } from '../../../models/FootballID.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { IFootballID } from '../models/types.js';

const router = Router();

// Helper to normalize document from MongoDB
function formatIdDoc(doc: any): IFootballID {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  let rawImages = obj.images || (obj.image ? [obj.image] : []);
  if (!Array.isArray(rawImages)) {
    rawImages = rawImages ? [rawImages] : [];
  }
  const images = rawImages
    .map((img: any) => {
      if (typeof img === 'string') {
        if (img.startsWith('/src/assets/images/')) {
          return img.replace('/src/assets/images/', '/images/');
        }
        return img;
      }
      return '';
    })
    .filter(Boolean);

  const finalImages = images.length > 0 ? images : ['/images/card_superstar_squad.jpg'];

  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    images: finalImages,
    price: Number(obj.price) || 0,
    originalPrice: Number(obj.originalPrice) || Number(obj.price) || 0,
    overallRating: Number(obj.overallRating) || 90,
    accountLevel: Number(obj.accountLevel) || 1,
    coinBalance: Number(obj.coinBalance) || 0,
    gpBalance: Number(obj.gpBalance) || 0,
    players: Array.isArray(obj.players) ? obj.players : [],
    rarePlayers: Array.isArray(obj.rarePlayers) ? obj.rarePlayers : [],
    specialCards: Array.isArray(obj.specialCards) ? obj.specialCards : [],
    status: obj.status === 'sold' ? 'sold' : 'available',
    featured: Boolean(obj.featured),
  };
}

// GET /api/ids with search, filter, and sorting directly from MongoDB
router.get('/', async (req, res) => {
  try {
    await connectToDatabase();

    const search = (req.query.search as string || '').toLowerCase().trim();
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const platform = (req.query.platform as string || '').trim();
    const region = (req.query.region as string || '').trim();
    const overallRating = parseFloat(req.query.overallRating as string);
    const accountLevel = parseFloat(req.query.accountLevel as string);
    const availability = (req.query.availability as string || '').trim();
    const sort = (req.query.sort as string || 'featured').trim();

    // Build real MongoDB Mongoose query
    const mongoQuery: Record<string, any> = {};

    if (search) {
      mongoQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { game: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { players: { $elemMatch: { $regex: search, $options: 'i' } } },
        { rarePlayers: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      mongoQuery.price = {};
      if (!isNaN(minPrice)) mongoQuery.price.$gte = minPrice;
      if (!isNaN(maxPrice)) mongoQuery.price.$lte = maxPrice;
    }

    if (platform && platform !== 'all') {
      mongoQuery.platform = { $regex: platform, $options: 'i' };
    }

    if (region && region !== 'all') {
      mongoQuery.region = { $regex: region, $options: 'i' };
    }

    if (!isNaN(overallRating)) {
      mongoQuery.overallRating = { $gte: overallRating };
    }

    if (!isNaN(accountLevel)) {
      mongoQuery.accountLevel = { $gte: accountLevel };
    }

    if (availability && availability !== 'all') {
      mongoQuery.status = availability;
    }

    // MongoDB Sorting
    let mongoSort: Record<string, any> = { featured: -1, createdAt: -1 };
    if (sort === 'price_asc') {
      mongoSort = { price: 1 };
    } else if (sort === 'price_desc') {
      mongoSort = { price: -1 };
    } else if (sort === 'newest') {
      mongoSort = { createdAt: -1 };
    }

    const docs = await FootballID.find(mongoQuery).sort(mongoSort).lean();
    const formatted = docs.map(formatIdDoc);

    res.json({ ids: formatted, total: formatted.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/ids failed:', error);
    res.status(500).json({
      error: (error as Error).message || 'Failed to connect to MongoDB Atlas database',
      details: (error as Error).message,
    });
  }
});

// GET /api/ids/:id - Real single document lookup from MongoDB
router.get('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await FootballID.findById(id).lean();
    }
    if (!doc) {
      doc = await FootballID.findOne({ $or: [{ _id: id }, { id }] }).lean();
    }

    if (!doc) {
      res.status(404).json({ error: 'Football ID listing not found in MongoDB database' });
      return;
    }

    res.json({ idListing: formatIdDoc(doc) });
  } catch (error) {
    console.error('[API Error] GET /api/ids/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: POST /api/ids - Create document directly in MongoDB
router.post('/', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const {
      title,
      game,
      price,
      originalPrice,
      images,
      overallRating,
      accountLevel,
      platform,
      region,
      coinBalance,
      gpBalance,
      players,
      rarePlayers,
      specialCards,
      description,
      status,
      featured,
    } = req.body;

    if (!title || price === undefined || overallRating === undefined) {
      res.status(400).json({ error: 'Title, price, and overall rating are required' });
      return;
    }

    const payload = {
      title,
      game: game || 'eFootball 2026',
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      images: Array.isArray(images) && images.length > 0 ? images : ['/images/card_superstar_squad.jpg'],
      overallRating: Number(overallRating),
      accountLevel: Number(accountLevel || 1),
      platform: platform || 'Mobile (Android/iOS)',
      region: region || 'Global',
      coinBalance: Number(coinBalance || 0),
      gpBalance: Number(gpBalance || 0),
      players: Array.isArray(players) ? players : (players ? String(players).split(',').map((s) => s.trim()) : []),
      rarePlayers: Array.isArray(rarePlayers) ? rarePlayers : (rarePlayers ? String(rarePlayers).split(',').map((s) => s.trim()) : []),
      specialCards: Array.isArray(specialCards) ? specialCards : (specialCards ? String(specialCards).split(',').map((s) => s.trim()) : []),
      description: description || '',
      status: (status === 'sold' ? 'sold' : 'available') as 'available' | 'sold',
      featured: Boolean(featured),
    };

    const created = await FootballID.create(payload);
    res.status(201).json({ message: 'Listing created in MongoDB', footballId: formatIdDoc(created) });
  } catch (error) {
    console.error('[API Error] POST /api/ids failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/ids/:id - Update document directly in MongoDB
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let updatedDoc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedDoc = await FootballID.findByIdAndUpdate(id, { $set: req.body }, { new: true }).lean();
    }
    if (!updatedDoc) {
      updatedDoc = await FootballID.findOneAndUpdate(
        { $or: [{ _id: id }, { id }] },
        { $set: req.body },
        { new: true }
      ).lean();
    }

    if (!updatedDoc) {
      res.status(404).json({ error: 'Football ID listing not found in MongoDB' });
      return;
    }

    res.json({ message: 'Listing updated in MongoDB', footballId: formatIdDoc(updatedDoc) });
  } catch (error) {
    console.error('[API Error] PUT /api/ids/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/ids/:id - Remove document from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let deleted = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await FootballID.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await FootballID.findOneAndDelete({ $or: [{ _id: id }, { id }] });
    }

    if (!deleted) {
      res.status(404).json({ error: 'Listing not found in MongoDB' });
      return;
    }

    res.json({ message: 'Listing deleted from MongoDB' });
  } catch (error) {
    console.error('[API Error] DELETE /api/ids/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

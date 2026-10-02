import { Router } from 'express';
import mongoose from 'mongoose';
import { FootballID } from '../../../models/FootballID.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';
import { IFootballID } from '../models/types.js';

const router = Router();

// Helper to normalize document
function formatIdDoc(doc: any): IFootballID {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const rawImages = obj.images || (obj.image ? [obj.image] : []);
  const images = Array.isArray(rawImages) && rawImages.length > 0
    ? rawImages
    : ['/src/assets/images/card_superstar_squad_1790958699479.jpg'];

  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    images,
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

// GET /api/ids with search, filter, and sorting from MongoDB
router.get('/', async (req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch (err) {
      console.warn('[MongoDB] Connection not active, checking fallback:', (err as Error).message);
    }

    const search = (req.query.search as string || '').toLowerCase().trim();
    const minPrice = parseFloat(req.query.minPrice as string);
    const maxPrice = parseFloat(req.query.maxPrice as string);
    const platform = (req.query.platform as string || '').trim();
    const region = (req.query.region as string || '').trim();
    const overallRating = parseFloat(req.query.overallRating as string);
    const accountLevel = parseFloat(req.query.accountLevel as string);
    const availability = (req.query.availability as string || '').trim();
    const sort = (req.query.sort as string || 'featured').trim();

    if (usingMongo) {
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
      return;
    }

    // Fallback if MONGODB_URI not yet configured in local environment
    const db = getDatabase();
    let items = [...db.footballIds];

    if (search) {
      items = items.filter((item) => {
        const matchTitle = item.title.toLowerCase().includes(search);
        const matchGame = item.game.toLowerCase().includes(search);
        const matchDesc = (item.description || '').toLowerCase().includes(search);
        const matchPlayers = item.players?.some((p) => p.toLowerCase().includes(search));
        const matchRare = item.rarePlayers?.some((p) => p.toLowerCase().includes(search));
        return matchTitle || matchGame || matchDesc || matchPlayers || matchRare;
      });
    }

    if (!isNaN(minPrice)) items = items.filter((item) => item.price >= minPrice);
    if (!isNaN(maxPrice)) items = items.filter((item) => item.price <= maxPrice);
    if (platform && platform !== 'all') {
      items = items.filter((item) => item.platform.toLowerCase().includes(platform.toLowerCase()));
    }
    if (region && region !== 'all') {
      items = items.filter((item) => item.region.toLowerCase().includes(region.toLowerCase()));
    }
    if (!isNaN(overallRating)) {
      items = items.filter((item) => item.overallRating >= overallRating);
    }
    if (!isNaN(accountLevel)) {
      items = items.filter((item) => item.accountLevel >= accountLevel);
    }
    if (availability && availability !== 'all') {
      items = items.filter((item) => item.status === availability);
    }

    if (sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    res.json({ ids: items.map(formatIdDoc), total: items.length, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/ids failed:', error);
    res.status(500).json({
      error: 'Unable to load football ID listings from database. Please check server logs.',
      details: (error as Error).message,
    });
  }
});

// GET /api/ids/:id
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
        doc = await FootballID.findById(id).lean();
      }
      if (!doc) {
        doc = await FootballID.findOne({ $or: [{ _id: id }, { id }] }).lean();
      }

      if (!doc) {
        res.status(404).json({ error: 'Football ID listing not found' });
        return;
      }

      res.json({ idListing: formatIdDoc(doc) });
      return;
    }

    const db = getDatabase();
    const item = db.footballIds.find((i) => i.id === id);

    if (!item) {
      res.status(404).json({ error: 'Football ID listing not found' });
      return;
    }

    res.json({ idListing: formatIdDoc(item) });
  } catch (error) {
    console.error('[API Error] GET /api/ids/:id failed:', error);
    res.status(500).json({ error: 'Failed to retrieve football ID listing' });
  }
});

// Admin: POST /api/ids
router.post('/', requireAdmin, async (req, res) => {
  try {
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

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const payload = {
      title,
      game: game || 'eFootball 2026',
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/card_superstar_squad_1790958699479.jpg'],
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

    if (usingMongo) {
      const created = await FootballID.create(payload);
      res.status(201).json({ message: 'Listing created in MongoDB', footballId: formatIdDoc(created) });
      return;
    }

    const db = getDatabase();
    const newId: IFootballID = {
      id: `fid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.footballIds.unshift(newId);
    saveDatabase(db);

    res.status(201).json({ message: 'Listing created successfully', footballId: newId });
  } catch (error) {
    console.error('[API Error] POST /api/ids failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/ids/:id
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
        updatedDoc = await FootballID.findByIdAndUpdate(id, { $set: req.body }, { new: true }).lean();
      }
      if (!updatedDoc) {
        updatedDoc = await FootballID.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $set: req.body }, { new: true }).lean();
      }

      if (!updatedDoc) {
        res.status(404).json({ error: 'Football ID listing not found' });
        return;
      }

      res.json({ message: 'Listing updated in MongoDB', footballId: formatIdDoc(updatedDoc) });
      return;
    }

    const db = getDatabase();
    const index = db.footballIds.findIndex((i) => i.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const existing = db.footballIds[index];
    const updated: IFootballID = {
      ...existing,
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
      originalPrice: req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : existing.originalPrice,
      overallRating: req.body.overallRating !== undefined ? Number(req.body.overallRating) : existing.overallRating,
      accountLevel: req.body.accountLevel !== undefined ? Number(req.body.accountLevel) : existing.accountLevel,
      coinBalance: req.body.coinBalance !== undefined ? Number(req.body.coinBalance) : existing.coinBalance,
      gpBalance: req.body.gpBalance !== undefined ? Number(req.body.gpBalance) : existing.gpBalance,
      updatedAt: new Date().toISOString(),
    };

    db.footballIds[index] = updated;
    saveDatabase(db);

    res.json({ message: 'Listing updated successfully', footballId: updated });
  } catch (error) {
    console.error('[API Error] PUT /api/ids/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/ids/:id
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
      return;
    }

    const db = getDatabase();
    const index = db.footballIds.findIndex((i) => i.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    db.footballIds.splice(index, 1);
    saveDatabase(db);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('[API Error] DELETE /api/ids/:id failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

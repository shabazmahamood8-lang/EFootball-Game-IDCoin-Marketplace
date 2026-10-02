import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { requireAdmin } from '../auth.js';
import { IFootballID } from '../models/types.js';

const router = Router();

// GET /api/ids with search, filter, and sorting
router.get('/', (req, res) => {
  const db = getDatabase();
  let items = [...db.footballIds];

  const search = (req.query.search as string || '').toLowerCase().trim();
  const minPrice = parseFloat(req.query.minPrice as string);
  const maxPrice = parseFloat(req.query.maxPrice as string);
  const platform = req.query.platform as string;
  const region = req.query.region as string;
  const overallRating = parseFloat(req.query.overallRating as string);
  const accountLevel = parseFloat(req.query.accountLevel as string);
  const availability = req.query.availability as string;
  const sort = req.query.sort as string || 'featured';

  if (search) {
    items = items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(search);
      const matchGame = item.game.toLowerCase().includes(search);
      const matchDesc = item.description.toLowerCase().includes(search);
      const matchPlayers = item.players?.some((p) => p.toLowerCase().includes(search));
      const matchRare = item.rarePlayers?.some((p) => p.toLowerCase().includes(search));
      return matchTitle || matchGame || matchDesc || matchPlayers || matchRare;
    });
  }

  if (!isNaN(minPrice)) {
    items = items.filter((item) => item.price >= minPrice);
  }

  if (!isNaN(maxPrice)) {
    items = items.filter((item) => item.price <= maxPrice);
  }

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

  // Sorting
  if (sort === 'price_asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    items.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Featured first, then newest
    items.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  res.json({ ids: items, total: items.length });
});

// GET /api/ids/:id
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const item = db.footballIds.find((i) => i.id === req.params.id);

  if (!item) {
    res.status(404).json({ error: 'Football ID listing not found' });
    return;
  }

  res.json({ idListing: item });
});

// Admin: POST /api/ids
router.post('/', requireAdmin, (req, res) => {
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

    if (!title || !price || !overallRating) {
      res.status(400).json({ error: 'Title, price, and overall rating are required' });
      return;
    }

    const db = getDatabase();
    const newId: IFootballID = {
      id: `fid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
      status: status === 'sold' ? 'sold' : 'available',
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.footballIds.unshift(newId);
    saveDatabase(db);

    res.status(201).json({ message: 'Listing created successfully', footballId: newId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PUT /api/ids/:id
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const db = getDatabase();
    const index = db.footballIds.findIndex((i) => i.id === req.params.id);

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
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: DELETE /api/ids/:id
router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const index = db.footballIds.findIndex((i) => i.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: 'Listing not found' });
    return;
  }

  db.footballIds.splice(index, 1);
  saveDatabase(db);

  res.json({ message: 'Listing deleted successfully' });
});

export default router;

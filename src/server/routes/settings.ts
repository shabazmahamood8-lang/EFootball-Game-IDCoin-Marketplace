import { Router } from 'express';
import { SiteSettings } from '../../../models/SiteSettings.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';

const router = Router();

// GET /api/settings
router.get('/', async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let doc = await SiteSettings.findOne().lean();
      if (!doc) {
        // Create initial default settings record if none exists
        doc = await SiteSettings.create({
          paymentNumberBkash: '+880 1712-345678',
          paymentNumberNagad: '+880 1812-345678',
          bankDetails: 'City Bank Ltd | A/C: 1102938475001 | Branch: Gulshan 2, Dhaka',
          paymentInstructions: '1. Send Money (Personal) to our official bKash or Nagad number.\n2. Keep your Transaction ID (TrxID) handy.\n3. Enter the TrxID and your phone number in the checkout form.\n4. Our team verifies payments and fulfills orders within 15–30 minutes.',
          supportWhatsapp: '+880 1712-345678',
          supportFacebook: 'https://facebook.com/footballidstore',
          supportEmail: 'support@footballidstore.com',
          supportPhone: '+880 1912-345678',
        });
      }
      res.json({ settings: doc, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    res.json({ settings: db.settings, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/settings failed:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// Admin: PUT /api/settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const updated = await SiteSettings.findOneAndUpdate(
        {},
        { $set: req.body },
        { upsert: true, new: true }
      );
      res.json({ message: 'Settings updated in MongoDB', settings: updated });
      return;
    }

    const db = getDatabase();
    db.settings = {
      ...db.settings,
      ...req.body,
    };
    saveDatabase(db);
    res.json({ message: 'Settings updated successfully', settings: db.settings });
  } catch (error) {
    console.error('[API Error] PUT /api/settings failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

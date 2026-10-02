import { Router } from 'express';
import { SiteSettings } from '../../../models/SiteSettings.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';

const router = Router();

const DEFAULT_SETTINGS = {
  paymentNumberBkash: '+880 1712-345678',
  paymentNumberNagad: '+880 1812-345678',
  bankDetails: 'City Bank Ltd | A/C: 1102938475001 | Branch: Gulshan 2, Dhaka',
  paymentInstructions:
    '1. Send Money (Personal) to our official bKash or Nagad number.\n2. Keep your Transaction ID (TrxID) handy.\n3. Enter the TrxID and your phone number in the checkout form.\n4. Our team verifies payments and fulfills orders within 15–30 minutes.',
  supportWhatsapp: '+880 1712-345678',
  supportFacebook: 'https://facebook.com/footballidstore',
  supportEmail: 'support@footballidstore.com',
  supportPhone: '+880 1912-345678',
  faqs: [
    {
      question: 'Is it safe to buy football accounts and coins here?',
      answer:
        'Yes. 100% of our football game IDs are verified ban-free, clean accounts. For coins, we only need your in-game Player ID—we never ask for your password.',
    },
    {
      question: 'How long does delivery take?',
      answer:
        'Coin top-ups are usually processed in 10 to 30 minutes. Football ID account transfers take between 15 to 45 minutes.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We support bKash, Nagad, and direct Bank Transfer. Orders are verified and dispatched immediately upon confirmation.',
    },
  ],
};

// GET /api/settings - Retrieve store settings from MongoDB
router.get('/', async (_req, res) => {
  try {
    await connectToDatabase();
    let doc = await SiteSettings.findOne().lean();

    if (!doc) {
      // Auto-initialize settings document in MongoDB collection
      const created = await SiteSettings.create(DEFAULT_SETTINGS);
      doc = created.toObject ? created.toObject() : created;
    }

    res.json({ settings: doc, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/settings failed:', error);
    res.status(500).json({
      error: (error as Error).message || 'Failed to retrieve site settings from MongoDB',
      details: (error as Error).message,
    });
  }
});

// Admin: PUT /api/settings - Update store settings in MongoDB
router.put('/', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const updated = await SiteSettings.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Settings updated in MongoDB', settings: updated });
  } catch (error) {
    console.error('[API Error] PUT /api/settings failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

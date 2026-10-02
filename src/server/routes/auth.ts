import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { generateToken, authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { IUser } from '../models/types.js';

const router = Router();

function formatUser(doc: any): Partial<IUser> {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
  };
}

// Ensure default administrator exists in MongoDB Atlas if empty
async function ensureAdminUser(): Promise<void> {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      await User.create({
        name: 'Head Administrator',
        email: 'admin@footballstore.com',
        phone: '+880 1712-000111',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('[Auth] Default administrator account initialized in MongoDB Atlas (admin@footballstore.com)');
    }
  } catch (err) {
    console.warn('[Auth Notice] Admin initialization check:', (err as Error).message);
  }
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    await connectToDatabase();
    await ensureAdminUser();

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? String(phone).trim() : '',
      role: 'customer',
    });

    const userFormatted = formatUser(created) as IUser;
    const token = generateToken(userFormatted);

    res.status(201).json({
      message: 'Account registered successfully in MongoDB',
      token,
      user: userFormatted,
    });
  } catch (error) {
    console.error('[API Error] POST /api/auth/register failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    await connectToDatabase();
    await ensureAdminUser();

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const userFormatted = formatUser(user) as IUser;
    const token = generateToken(userFormatted);

    res.json({
      message: 'Logged in successfully via MongoDB',
      token,
      user: userFormatted,
    });
  } catch (error) {
    console.error('[API Error] POST /api/auth/login failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Verify current session
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: formatUser(req.user) });
});

// Admin: list all customers and accounts from MongoDB
router.get('/users', requireAdmin, async (_req, res) => {
  try {
    await connectToDatabase();
    const docs = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json({ users: docs.map(formatUser), total: docs.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/auth/users failed:', error);
    res.status(500).json({ error: 'Failed to retrieve users from MongoDB' });
  }
});

export default router;

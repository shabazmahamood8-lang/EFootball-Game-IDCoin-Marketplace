import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../../../models/User.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { getDatabase, saveDatabase } from '../db.js';
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

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const cleanEmail = String(email).trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (usingMongo) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        res.status(400).json({ error: 'An account with this email already exists' });
        return;
      }

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
      return;
    }

    const db = getDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const newUser: IUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '',
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDatabase(db);

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPass } = newUser;

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: userWithoutPass,
    });
  } catch (error) {
    console.error('[API Error] POST /api/auth/register failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const cleanEmail = String(email).trim().toLowerCase();

    if (usingMongo) {
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
      return;
    }

    const db = getDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPass } = user;

    res.json({
      message: 'Logged in successfully',
      token,
      user: userWithoutPass,
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

// Admin: list all users
router.get('/users', requireAdmin, async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
      res.json({ users: users.map(formatUser), total: users.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    const safeUsers = db.users.map(({ password: _, ...u }) => u);
    res.json({ users: safeUsers, total: safeUsers.length, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/auth/users failed:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

export default router;

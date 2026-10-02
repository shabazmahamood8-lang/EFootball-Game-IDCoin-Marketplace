import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../db.js';
import { generateToken, authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { IUser } from '../models/types.js';

const router = Router();

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

    const db = getDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
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

    const db = getDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

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
    res.status(500).json({ error: (error as Error).message });
  }
});

// Verify current session
router.get('/me', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const { password: _, ...userWithoutPass } = req.user;
  res.json({ user: userWithoutPass });
});

// Admin: list all users
router.get('/users', requireAdmin, (_req, res) => {
  const db = getDatabase();
  const safeUsers = db.users.map(({ password: _, ...u }) => u);
  res.json({ users: safeUsers });
});

export default router;

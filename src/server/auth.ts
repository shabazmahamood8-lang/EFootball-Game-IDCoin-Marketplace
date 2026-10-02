import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../../models/User.js';
import { connectToDatabase, isMongoConnected } from '../../lib/mongodb.js';
import { getDatabase } from './db.js';
import { IUser } from './models/types.js';

const JWT_SECRET = process.env.BETTER_AUTH_SECRET || 'football-id-store-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function generateToken(user: Partial<IUser>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let userDoc = null;
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        userDoc = await User.findById(decoded.id).lean();
      }
      if (!userDoc) {
        userDoc = await User.findOne({ $or: [{ _id: decoded.id }, { id: decoded.id }, { email: decoded.email }] }).lean();
      }

      if (!userDoc) {
        res.status(401).json({ error: 'Unauthorized: User no longer exists in database' });
        return;
      }

      const formatted: IUser = {
        id: (userDoc as any)._id?.toString() || (userDoc as any).id,
        name: (userDoc as any).name,
        email: (userDoc as any).email,
        phone: (userDoc as any).phone || '',
        role: (userDoc as any).role || 'customer',
        createdAt: (userDoc as any).createdAt?.toString() || new Date().toISOString(),
        updatedAt: (userDoc as any).updatedAt?.toString() || new Date().toISOString(),
      };

      req.user = formatted;
      next();
      return;
    }

    const db = getDatabase();
    const user = db.users.find((u) => u.id === decoded.id || u.email === decoded.email);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User no longer exists' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Error]:', error);
    res.status(500).json({ error: 'Authentication verification failed' });
  }
}

export async function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        let usingMongo = false;
        try {
          await connectToDatabase();
          usingMongo = isMongoConnected();
        } catch {}

        if (usingMongo) {
          let userDoc = null;
          if (mongoose.Types.ObjectId.isValid(decoded.id)) {
            userDoc = await User.findById(decoded.id).lean();
          }
          if (!userDoc) {
            userDoc = await User.findOne({ $or: [{ _id: decoded.id }, { id: decoded.id }, { email: decoded.email }] }).lean();
          }
          if (userDoc) {
            req.user = {
              id: (userDoc as any)._id?.toString() || (userDoc as any).id,
              name: (userDoc as any).name,
              email: (userDoc as any).email,
              phone: (userDoc as any).phone || '',
              role: (userDoc as any).role || 'customer',
              createdAt: (userDoc as any).createdAt?.toString() || new Date().toISOString(),
              updatedAt: (userDoc as any).updatedAt?.toString() || new Date().toISOString(),
            };
          }
        } else {
          const db = getDatabase();
          const user = db.users.find((u) => u.id === decoded.id || u.email === decoded.email);
          if (user) {
            req.user = user;
          }
        }
      } catch {}
    }
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }
    next();
  });
}

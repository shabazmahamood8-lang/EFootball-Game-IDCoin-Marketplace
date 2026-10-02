import { Router } from 'express';
import { isMongoConnected, getDatabaseName, connectToDatabase } from '../../../lib/mongodb.js';
import { FootballID } from '../../../models/FootballID.js';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { Order } from '../../../models/Order.js';
import { User } from '../../../models/User.js';

const router = Router();

// GET /api/health - Basic health check
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'FOOTBALL ID STORE',
    environment: process.env.NODE_ENV || 'production',
  });
});

// GET /api/health/database - Safe server-side database health check
router.get('/database', async (_req, res) => {
  try {
    let connected = isMongoConnected();

    if (!connected && process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        connected = isMongoConnected();
      } catch {
        connected = false;
      }
    }

    if (!connected) {
      res.status(503).json({
        database: 'disconnected',
        environment: process.env.NODE_ENV || 'production',
        databaseName: getDatabaseName(),
        message: 'MongoDB is currently not connected. Verify MONGODB_URI and Network Access.',
      });
      return;
    }

    // Safely retrieve collection document counts from real MongoDB
    const [footballIDsCount, coinPackagesCount, ordersCount, usersCount] = await Promise.all([
      FootballID.countDocuments().catch(() => 0),
      CoinPackage.countDocuments().catch(() => 0),
      Order.countDocuments().catch(() => 0),
      User.countDocuments().catch(() => 0),
    ]);

    res.json({
      database: 'connected',
      environment: process.env.NODE_ENV || 'production',
      databaseName: getDatabaseName(),
      collections: {
        footballIDs: footballIDsCount,
        coinPackages: coinPackagesCount,
        orders: ordersCount,
        users: usersCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      database: 'error',
      environment: process.env.NODE_ENV || 'production',
      error: 'Failed to verify database status',
    });
  }
});

export default router;

import { Router } from 'express';
import { FootballID } from '../../../models/FootballID.js';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { Order } from '../../../models/Order.js';
import { User } from '../../../models/User.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { requireAdmin } from '../auth.js';
import { getDatabase } from '../db.js';

const router = Router();

router.get('/stats', requireAdmin, async (_req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      const [
        totalIds,
        availableIds,
        soldIds,
        totalCoinPackages,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        deliveredOrders,
      ] = await Promise.all([
        FootballID.countDocuments(),
        FootballID.countDocuments({ status: 'available' }),
        FootballID.countDocuments({ status: 'sold' }),
        CoinPackage.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: { $in: ['pending', 'payment_submitted', 'processing'] } }),
        Order.countDocuments({ status: 'delivered' }),
        User.countDocuments({ role: 'customer' }),
        Order.find({ status: 'delivered' }).select('price').lean(),
      ]);

      const totalRevenue = deliveredOrders.reduce((sum, o: any) => sum + (Number(o.price) || 0), 0);

      res.json({
        totalIds,
        availableIds,
        soldIds,
        totalCoinPackages,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalCustomers,
        totalRevenue,
        source: 'mongodb',
      });
      return;
    }

    const db = getDatabase();
    const totalIds = db.footballIds.length;
    const availableIds = db.footballIds.filter((i) => i.status === 'available').length;
    const soldIds = db.footballIds.filter((i) => i.status === 'sold').length;
    const totalCoinPackages = db.coinPackages.length;
    const totalOrders = db.orders.length;
    const pendingOrders = db.orders.filter((o) =>
      ['pending', 'payment_submitted', 'processing'].includes(o.status)
    ).length;
    const completedOrders = db.orders.filter((o) => o.status === 'delivered').length;
    const totalCustomers = db.users.filter((u) => u.role === 'customer').length;
    const totalRevenue = db.orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + o.price, 0);

    res.json({
      totalIds,
      availableIds,
      soldIds,
      totalCoinPackages,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalRevenue,
      source: 'local',
    });
  } catch (error) {
    console.error('[API Error] GET /api/admin/stats failed:', error);
    res.status(500).json({ error: 'Failed to calculate dashboard statistics' });
  }
});

export default router;

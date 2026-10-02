import { Router } from 'express';
import { getDatabase } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = Router();

router.get('/stats', requireAdmin, (_req, res) => {
  const db = getDatabase();

  const totalIds = db.footballIds.length;
  const availableIds = db.footballIds.filter((i) => i.status === 'available').length;
  const soldIds = db.footballIds.filter((i) => i.status === 'sold').length;

  const totalCoinPackages = db.coinPackages.length;

  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter((o) => ['pending', 'payment_submitted', 'processing'].includes(o.status)).length;
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
  });
});

export default router;

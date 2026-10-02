import { Router } from 'express';
import { getDatabase, saveDatabase } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { IOrder, OrderStatus } from '../models/types.js';

const router = Router();

// POST /api/orders - Authenticated user creates an order
router.post('/', authenticate, (req: AuthRequest, res) => {
  try {
    const {
      orderType,
      footballId,
      coinPackageId,
      playerID,
      customerName,
      email,
      phone,
      paymentMethod,
      paymentTransactionId,
      note,
    } = req.body;

    if (!orderType || !['ID', 'COINS'].includes(orderType)) {
      res.status(400).json({ error: 'Valid orderType (ID or COINS) is required' });
      return;
    }

    if (!customerName || !email || !phone || !paymentMethod) {
      res.status(400).json({ error: 'Customer name, email, phone, and payment method are required' });
      return;
    }

    const db = getDatabase();
    let serverPrice = 0;
    let footballIdTitle: string | undefined;
    let coinAmount: number | undefined;

    if (orderType === 'ID') {
      if (!footballId) {
        res.status(400).json({ error: 'footballId is required for ID purchase' });
        return;
      }

      const listing = db.footballIds.find((item) => item.id === footballId);
      if (!listing) {
        res.status(404).json({ error: 'Football ID listing not found' });
        return;
      }

      if (listing.status === 'sold') {
        res.status(400).json({ error: 'This Football ID is already SOLD OUT' });
        return;
      }

      // Securely fetch price directly from database
      serverPrice = listing.price;
      footballIdTitle = listing.title;

      // Mark ID as sold so no double booking occurs
      listing.status = 'sold';
      listing.updatedAt = new Date().toISOString();
    } else {
      // COINS purchase
      if (!coinPackageId) {
        res.status(400).json({ error: 'coinPackageId is required for Coin purchase' });
        return;
      }

      if (!playerID || playerID.trim() === '') {
        res.status(400).json({ error: 'Player ID / Game ID is required for coin delivery' });
        return;
      }

      const pkg = db.coinPackages.find((p) => p.id === coinPackageId);
      if (!pkg) {
        res.status(404).json({ error: 'Coin package not found' });
        return;
      }

      // Securely fetch price and coin amount directly from database
      serverPrice = pkg.price;
      coinAmount = pkg.coinAmount;
    }

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: IOrder = {
      id: orderId,
      userId: req.user!.id,
      orderType,
      footballId: orderType === 'ID' ? footballId : undefined,
      footballIdTitle,
      coinPackageId: orderType === 'COINS' ? coinPackageId : undefined,
      coinAmount,
      price: serverPrice,
      playerID: orderType === 'COINS' ? playerID : undefined,
      customerName,
      email,
      phone,
      paymentMethod,
      paymentTransactionId: paymentTransactionId || '',
      note: note || '',
      status: paymentTransactionId ? 'payment_submitted' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/orders/my-orders - Customer gets their own orders
router.get('/my-orders', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const userOrders = db.orders.filter((o) => o.userId === req.user!.id);
  res.json({ orders: userOrders });
});

// GET /api/orders/:id - Customer or Admin views single order
router.get('/:id', authenticate, (req: AuthRequest, res) => {
  const db = getDatabase();
  const order = db.orders.find((o) => o.id === req.params.id);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Security: Customer can only view their own order
  if (req.user?.role !== 'admin' && order.userId !== req.user?.id) {
    res.status(403).json({ error: 'Access denied to this order' });
    return;
  }

  res.json({ order });
});

// Admin: GET /api/orders/admin/all
router.get('/admin/all', requireAdmin, (req, res) => {
  const db = getDatabase();
  let orders = [...db.orders];

  const status = req.query.status as string;
  const type = req.query.type as string;

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  if (type && type !== 'all') {
    orders = orders.filter((o) => o.orderType === type);
  }

  res.json({ orders, total: orders.length });
});

// Admin: PATCH /api/orders/:id/status
router.patch('/:id/status', requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses: OrderStatus[] = [
      'pending',
      'payment_submitted',
      'confirmed',
      'processing',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const db = getDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // If order was cancelled and was for an ID, make the ID available again
    if (status === 'cancelled' && order.footballId) {
      const listing = db.footballIds.find((item) => item.id === order.footballId);
      if (listing) {
        listing.status = 'available';
        listing.updatedAt = new Date().toISOString();
      }
    }

    saveDatabase(db);
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

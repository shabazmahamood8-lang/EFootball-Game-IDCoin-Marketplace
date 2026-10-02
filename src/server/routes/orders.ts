import { Router } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/Order.js';
import { FootballID } from '../../../models/FootballID.js';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { connectToDatabase, isMongoConnected } from '../../../lib/mongodb.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
import { getDatabase, saveDatabase } from '../db.js';
import { IOrder } from '../models/types.js';

const router = Router();

function formatOrderDoc(doc: any): IOrder {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...obj,
    id: obj._id?.toString() || obj.id,
    price: Number(obj.price) || 0,
    coinAmount: obj.coinAmount ? Number(obj.coinAmount) : undefined,
  };
}

// POST /api/orders - Authenticated user creates an order
router.post('/', authenticate, async (req: AuthRequest, res) => {
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

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    let serverPrice = 0;
    let footballIdTitle: string | undefined;
    let coinAmount: number | undefined;

    if (usingMongo) {
      if (orderType === 'ID') {
        if (!footballId) {
          res.status(400).json({ error: 'footballId is required for ID purchase' });
          return;
        }

        let listing = null;
        if (mongoose.Types.ObjectId.isValid(footballId)) {
          listing = await FootballID.findById(footballId);
        }
        if (!listing) {
          listing = await FootballID.findOne({ $or: [{ _id: footballId }, { id: footballId }] });
        }

        if (!listing) {
          res.status(404).json({ error: 'Football ID listing not found in database' });
          return;
        }

        if (listing.status === 'sold') {
          res.status(400).json({ error: 'This Football ID is already SOLD OUT' });
          return;
        }

        serverPrice = listing.price;
        footballIdTitle = listing.title;

        // Mark listing as sold in MongoDB
        listing.status = 'sold';
        await listing.save();
      } else {
        // COINS
        if (!coinPackageId) {
          res.status(400).json({ error: 'coinPackageId is required for Coin purchase' });
          return;
        }

        if (!playerID || playerID.trim() === '') {
          res.status(400).json({ error: 'Player ID / Game ID is required for coin delivery' });
          return;
        }

        let pkg = null;
        if (mongoose.Types.ObjectId.isValid(coinPackageId)) {
          pkg = await CoinPackage.findById(coinPackageId);
        }
        if (!pkg) {
          pkg = await CoinPackage.findOne({ $or: [{ _id: coinPackageId }, { id: coinPackageId }] });
        }

        if (!pkg) {
          res.status(404).json({ error: 'Coin package not found in database' });
          return;
        }

        serverPrice = pkg.price;
        coinAmount = pkg.coinAmount;
      }

      const newOrderDoc = await Order.create({
        userId: req.user!.id,
        user: req.user!.id,
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
      });

      res.status(201).json({
        message: 'Order created successfully in MongoDB',
        order: formatOrderDoc(newOrderDoc),
      });
      return;
    }

    // Fallback if MONGODB_URI not active
    const db = getDatabase();
    if (orderType === 'ID') {
      const listing = db.footballIds.find((item) => item.id === footballId);
      if (!listing) {
        res.status(404).json({ error: 'Football ID listing not found' });
        return;
      }
      if (listing.status === 'sold') {
        res.status(400).json({ error: 'This Football ID is already SOLD OUT' });
        return;
      }
      serverPrice = listing.price;
      footballIdTitle = listing.title;
      listing.status = 'sold';
    } else {
      const pkg = db.coinPackages.find((p) => p.id === coinPackageId);
      if (!pkg) {
        res.status(404).json({ error: 'Coin package not found' });
        return;
      }
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
    console.error('[API Error] POST /api/orders failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/orders/my-orders - Customer gets their own orders
router.get('/my-orders', authenticate, async (req: AuthRequest, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const userId = req.user!.id;

    if (usingMongo) {
      const docs = await Order.find({
        $or: [{ userId }, { user: userId }],
      }).sort({ createdAt: -1 }).lean();

      res.json({ orders: docs.map(formatOrderDoc) });
      return;
    }

    const db = getDatabase();
    const userOrders = db.orders.filter((o) => o.userId === userId);
    res.json({ orders: userOrders.map(formatOrderDoc) });
  } catch (error) {
    console.error('[API Error] GET /api/orders/my-orders failed:', error);
    res.status(500).json({ error: 'Failed to retrieve your orders from database' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    let order: any = null;

    if (usingMongo) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await Order.findById(id).lean();
      }
      if (!order) {
        order = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();
      }
    } else {
      const db = getDatabase();
      order = db.orders.find((o) => o.id === id);
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Security: Customer can only view their own order
    const orderUserId = order.userId || order.user?.toString();
    if (req.user?.role !== 'admin' && orderUserId !== req.user?.id) {
      res.status(403).json({ error: 'Access denied to this order' });
      return;
    }

    res.json({ order: formatOrderDoc(order) });
  } catch (error) {
    console.error('[API Error] GET /api/orders/:id failed:', error);
    res.status(500).json({ error: 'Failed to retrieve order' });
  }
});

// Admin: GET /api/orders/admin/all
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    const status = req.query.status as string;
    const type = req.query.type as string;

    if (usingMongo) {
      const query: Record<string, any> = {};
      if (status && status !== 'all') query.status = status;
      if (type && type !== 'all') query.orderType = type;

      const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
      res.json({ orders: docs.map(formatOrderDoc), total: docs.length, source: 'mongodb' });
      return;
    }

    const db = getDatabase();
    let orders = [...db.orders];
    if (status && status !== 'all') orders = orders.filter((o) => o.status === status);
    if (type && type !== 'all') orders = orders.filter((o) => o.orderType === type);

    res.json({ orders: orders.map(formatOrderDoc), total: orders.length, source: 'local' });
  } catch (error) {
    console.error('[API Error] GET /api/orders/admin/all failed:', error);
    res.status(500).json({ error: 'Failed to retrieve orders from database' });
  }
});

// Admin: PATCH /api/orders/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
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

    let usingMongo = false;
    try {
      await connectToDatabase();
      usingMongo = isMongoConnected();
    } catch {}

    if (usingMongo) {
      let orderDoc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        orderDoc = await Order.findById(id);
      }
      if (!orderDoc) {
        orderDoc = await Order.findOne({ $or: [{ _id: id }, { id }] });
      }

      if (!orderDoc) {
        res.status(404).json({ error: 'Order not found in MongoDB' });
        return;
      }

      orderDoc.status = status;
      await orderDoc.save();

      // If order was cancelled and was for an ID, restore ID availability
      if (status === 'cancelled' && orderDoc.footballId) {
        let listing = null;
        if (mongoose.Types.ObjectId.isValid(orderDoc.footballId)) {
          listing = await FootballID.findById(orderDoc.footballId);
        }
        if (!listing) {
          listing = await FootballID.findOne({ $or: [{ _id: orderDoc.footballId }, { id: orderDoc.footballId }] });
        }
        if (listing) {
          listing.status = 'available';
          await listing.save();
        }
      }

      res.json({ message: 'Order status updated in MongoDB', order: formatOrderDoc(orderDoc) });
      return;
    }

    const db = getDatabase();
    const order = db.orders.find((o) => o.id === id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (status === 'cancelled' && order.footballId) {
      const listing = db.footballIds.find((item) => item.id === order.footballId);
      if (listing) {
        listing.status = 'available';
        listing.updatedAt = new Date().toISOString();
      }
    }

    saveDatabase(db);
    res.json({ message: 'Order status updated successfully', order: formatOrderDoc(order) });
  } catch (error) {
    console.error('[API Error] PATCH /api/orders/:id/status failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

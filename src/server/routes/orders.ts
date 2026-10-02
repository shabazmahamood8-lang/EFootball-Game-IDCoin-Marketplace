import { Router } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../../models/Order.js';
import { FootballID } from '../../../models/FootballID.js';
import { CoinPackage } from '../../../models/CoinPackage.js';
import { connectToDatabase } from '../../../lib/mongodb.js';
import { authenticate, requireAdmin, AuthRequest } from '../auth.js';
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

// POST /api/orders - Authenticated user creates an order directly in MongoDB
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
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

    let serverPrice = 0;
    let footballIdTitle: string | undefined;
    let coinAmount: number | undefined;

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
        res.status(404).json({ error: 'Football ID listing not found in MongoDB' });
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
        res.status(404).json({ error: 'Coin package not found in MongoDB' });
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
  } catch (error) {
    console.error('[API Error] POST /api/orders failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/orders/my-orders - Customer gets their own orders from MongoDB
router.get('/my-orders', authenticate, async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    const userId = req.user!.id;
    const docs = await Order.find({
      $or: [{ userId }, { user: userId }],
    }).sort({ createdAt: -1 }).lean();

    res.json({ orders: docs.map(formatOrderDoc) });
  } catch (error) {
    console.error('[API Error] GET /api/orders/my-orders failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await connectToDatabase();
    const id = req.params.id;

    let order: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).lean();
    }
    if (!order) {
      order = await Order.findOne({ $or: [{ _id: id }, { id }] }).lean();
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found in MongoDB' });
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
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: GET /api/orders/admin/all - Get all orders from MongoDB
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
    const status = req.query.status as string;
    const type = req.query.type as string;

    const query: Record<string, any> = {};
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.orderType = type;

    const docs = await Order.find(query).sort({ createdAt: -1 }).lean();
    res.json({ orders: docs.map(formatOrderDoc), total: docs.length, source: 'mongodb' });
  } catch (error) {
    console.error('[API Error] GET /api/orders/admin/all failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Admin: PATCH /api/orders/:id/status - Update order status in MongoDB
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    await connectToDatabase();
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

    // If order was cancelled and was for an ID, restore ID availability in MongoDB
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
  } catch (error) {
    console.error('[API Error] PATCH /api/orders/:id/status failed:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

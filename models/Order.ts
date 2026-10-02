import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'payment_submitted'
  | 'confirmed'
  | 'processing'
  | 'delivered'
  | 'cancelled';

export interface IOrderDocument extends Document {
  userId: string;
  user?: mongoose.Types.ObjectId | string;
  orderType: 'ID' | 'COINS';
  footballId?: string;
  footballIdTitle?: string;
  coinPackageId?: string;
  coinAmount?: number;
  price: number;
  playerID?: string;
  customerName: string;
  email: string;
  phone: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer';
  paymentTransactionId?: string;
  note?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: String, required: true, index: true },
    user: { type: Schema.Types.Mixed },
    orderType: { type: String, enum: ['ID', 'COINS'], required: true, index: true },
    footballId: { type: String },
    footballIdTitle: { type: String },
    coinPackageId: { type: String },
    coinAmount: { type: Number },
    price: { type: Number, required: true, min: 0 },
    playerID: { type: String },
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'Bank Transfer'],
      required: true,
    },
    paymentTransactionId: { type: String, default: '' },
    note: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'pending',
        'payment_submitted',
        'confirmed',
        'processing',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString() || ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString() || ret.id;
        return ret;
      },
    },
  }
);

export const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>('Order', OrderSchema, 'orders');

export default Order;

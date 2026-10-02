import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoinPackageDocument extends Document {
  coinAmount: number;
  price: number;
  originalPrice: number;
  discount: number;
  game: string;
  platform: string;
  deliveryInfo: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CoinPackageSchema = new Schema<ICoinPackageDocument>(
  {
    coinAmount: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    game: { type: String, default: 'eFootball 2026', trim: true },
    platform: { type: String, default: 'All Platforms (Mobile / PC / Console)' },
    deliveryInfo: {
      type: String,
      default: 'Instant safe top-up via Player ID. 10 - 20 mins delivery.',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

export const CoinPackage: Model<ICoinPackageDocument> =
  mongoose.models.CoinPackage ||
  mongoose.model<ICoinPackageDocument>('CoinPackage', CoinPackageSchema, 'coinpackages');

export default CoinPackage;

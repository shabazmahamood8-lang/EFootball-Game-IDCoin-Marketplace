import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFootballIDDocument extends Document {
  title: string;
  game: string;
  price: number;
  originalPrice: number;
  images: string[];
  overallRating: number;
  accountLevel: number;
  platform: string;
  region: string;
  coinBalance: number;
  gpBalance?: number;
  players: string[];
  rarePlayers: string[];
  specialCards: string[];
  description: string;
  status: 'available' | 'sold';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FootballIDSchema = new Schema<IFootballIDDocument>(
  {
    title: { type: String, required: true, trim: true },
    game: { type: String, default: 'eFootball 2026', trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      default: [],
      set: (val: unknown) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim() !== '') return [val];
        return [];
      },
    },
    overallRating: { type: Number, required: true, min: 0 },
    accountLevel: { type: Number, default: 1, min: 1 },
    platform: { type: String, default: 'Mobile (Android/iOS)' },
    region: { type: String, default: 'Global' },
    coinBalance: { type: Number, default: 0, min: 0 },
    gpBalance: { type: Number, default: 0, min: 0 },
    players: { type: [String], default: [] },
    rarePlayers: { type: [String], default: [] },
    specialCards: { type: [String], default: [] },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
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

// Prevent re-compiling Model during hot reloading
export const FootballID: Model<IFootballIDDocument> =
  mongoose.models.FootballID ||
  mongoose.model<IFootballIDDocument>('FootballID', FootballIDSchema, 'footballids');

export default FootballID;

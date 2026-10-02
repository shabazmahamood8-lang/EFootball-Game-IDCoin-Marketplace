import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReviewDocument extends Document {
  userId: string;
  user?: mongoose.Types.ObjectId | string;
  userName: string;
  product: string;
  orderId?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    userId: { type: String, required: true },
    user: { type: Schema.Types.Mixed },
    userName: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    orderId: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['approved', 'pending'], default: 'approved', index: true },
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

export const Review: Model<IReviewDocument> =
  mongoose.models.Review || mongoose.model<IReviewDocument>('Review', ReviewSchema, 'reviews');

export default Review;

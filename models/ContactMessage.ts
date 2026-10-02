import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContactMessageDocument extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessageDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread', index: true },
  },
  { timestamps: true }
);

export const ContactMessage: Model<IContactMessageDocument> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessageDocument>(
    'ContactMessage',
    ContactMessageSchema,
    'contactmessages'
  );

export default ContactMessage;

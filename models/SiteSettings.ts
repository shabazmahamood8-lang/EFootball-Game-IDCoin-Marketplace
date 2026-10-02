import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettingsDocument extends Document {
  paymentNumberBkash: string;
  paymentNumberNagad: string;
  bankDetails: string;
  paymentInstructions: string;
  supportWhatsapp: string;
  supportFacebook: string;
  supportEmail: string;
  supportPhone: string;
  faqs: { question: string; answer: string }[];
}

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    paymentNumberBkash: { type: String, default: '+880 1712-345678' },
    paymentNumberNagad: { type: String, default: '+880 1812-345678' },
    bankDetails: {
      type: String,
      default: 'City Bank Ltd | A/C: 1102938475001 | Branch: Gulshan 2, Dhaka',
    },
    paymentInstructions: {
      type: String,
      default:
        'Please send Money (Personal) to our official bKash or Nagad number, and provide your Transaction ID (TrxID) in the checkout form.',
    },
    supportWhatsapp: { type: String, default: '+880 1712-345678' },
    supportFacebook: { type: String, default: 'https://facebook.com/footballidstore' },
    supportEmail: { type: String, default: 'support@footballidstore.com' },
    supportPhone: { type: String, default: '+880 1912-345678' },
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettingsDocument> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>('SiteSettings', SiteSettingsSchema, 'sitesettings');

export default SiteSettings;

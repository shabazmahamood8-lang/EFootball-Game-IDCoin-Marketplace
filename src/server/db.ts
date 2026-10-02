import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  IUser,
  IFootballID,
  ICoinPackage,
  IOrder,
  IReview,
  ISiteSettings,
  IContactMessage,
} from './models/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Mongoose Schemas for MongoDB Atlas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

const FootballIDSchema = new mongoose.Schema({
  title: { type: String, required: true },
  game: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  images: [{ type: String }],
  overallRating: { type: Number, required: true },
  accountLevel: { type: Number, required: true },
  platform: { type: String, required: true },
  region: { type: String, required: true },
  coinBalance: { type: Number, default: 0 },
  gpBalance: { type: Number, default: 0 },
  players: [{ type: String }],
  rarePlayers: [{ type: String }],
  specialCards: [{ type: String }],
  description: { type: String, required: true },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const CoinPackageSchema = new mongoose.Schema({
  coinAmount: { type: Number, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  game: { type: String, required: true },
  platform: { type: String, required: true },
  deliveryInfo: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderType: { type: String, enum: ['ID', 'COINS'], required: true },
  footballId: { type: String },
  footballIdTitle: { type: String },
  coinPackageId: { type: String },
  coinAmount: { type: Number },
  price: { type: Number, required: true },
  playerID: { type: String },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, enum: ['bKash', 'Nagad', 'Bank Transfer'], required: true },
  paymentTransactionId: { type: String },
  note: { type: String },
  status: {
    type: String,
    enum: ['pending', 'payment_submitted', 'confirmed', 'processing', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  product: { type: String, required: true },
  orderId: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
}, { timestamps: true });

const SiteSettingsSchema = new mongoose.Schema({
  paymentNumberBkash: { type: String, default: '+880 1712-345678' },
  paymentNumberNagad: { type: String, default: '+880 1812-345678' },
  bankDetails: { type: String, default: 'City Bank Ltd | A/C: 1102938475001 | Branch: Gulshan, Dhaka' },
  paymentInstructions: { type: String, default: 'Please send Money (Personal) to our official bKash or Nagad number, and provide your Transaction ID in the order form.' },
  supportWhatsapp: { type: String, default: '+880 1712-345678' },
  supportFacebook: { type: String, default: 'https://facebook.com/footballidstore' },
  supportEmail: { type: String, default: 'support@footballidstore.com' },
  supportPhone: { type: String, default: '+880 1912-345678' },
  faqs: [{ question: String, answer: String }],
});

const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const FootballIDModel = mongoose.models.FootballID || mongoose.model('FootballID', FootballIDSchema);
export const CoinPackageModel = mongoose.models.CoinPackage || mongoose.model('CoinPackage', CoinPackageSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
export const ContactMessageModel = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

export interface DatabaseState {
  users: IUser[];
  footballIds: IFootballID[];
  coinPackages: ICoinPackage[];
  orders: IOrder[];
  reviews: IReview[];
  settings: ISiteSettings;
  contactMessages: IContactMessage[];
}

let isMongoConnected = false;

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === '' || uri.includes('username:password')) {
    return false;
  }
  try {
    if (mongoose.connection.readyState === 1) {
      isMongoConnected = true;
      return true;
    }
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'football_id_store',
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('Successfully connected to MongoDB Atlas');
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed, operating with resilient persistent storage:', (error as Error).message);
    isMongoConnected = false;
    return false;
  }
}

export function isDbUsingMongo(): boolean {
  return isMongoConnected;
}

// Initial realistic football data
function getInitialData(): DatabaseState {
  const adminPasswordHash = bcrypt.hashSync('admin123456', 10);
  const buyerPasswordHash = bcrypt.hashSync('buyer123456', 10);

  const heroImg = '/src/assets/images/hero_football_stadium_1790958685031.jpg';
  const superstarImg = '/src/assets/images/card_superstar_squad_1790958699479.jpg';
  const formationImg = '/src/assets/images/card_elite_formation_1790958713788.jpg';
  const coinsImg = '/src/assets/images/football_coins_treasure_1790958724643.jpg';

  return {
    users: [
      {
        id: 'usr-admin-01',
        name: 'Head Administrator',
        email: 'admin@footballstore.com',
        phone: '+880 1712-000111',
        password: adminPasswordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr-buyer-02',
        name: 'Rahim Khan',
        email: 'buyer@footballstore.com',
        phone: '+880 1812-999888',
        password: buyerPasswordHash,
        role: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    footballIds: [
      {
        id: 'fid-101',
        title: 'Big Time Messi 103 + Booster Haaland Epic God Squad',
        game: 'eFootball 2026',
        price: 4800,
        originalPrice: 6000,
        images: [superstarImg, formationImg, heroImg],
        overallRating: 102,
        accountLevel: 94,
        platform: 'Mobile (Android/iOS)',
        region: 'Global / Asia',
        coinBalance: 3450,
        gpBalance: 4200000,
        players: ['L. Messi (Big Time 103)', 'E. Haaland (Show Time)', 'K. Mbappé (Epic Booster)', 'K. De Bruyne', 'V. van Dijk (Show Time)', 'T. Courtois (Epic)'],
        rarePlayers: ['Big Time 2022 World Cup Messi', 'Epic Booster Ronaldinho', 'Show Time Haaland 101'],
        specialCards: ['14 Big Time Cards', '22 Epic Cards', '35 Highlight Cards'],
        description: 'Spectacular tournament-ready account with 102 Team Strength. Unlinkable Konami ID ready to link directly to your fresh email. Full managers included: Pep Guardiola (88 Booster) and Carlo Ancelotti.',
        status: 'available',
        featured: true,
        createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fid-102',
        title: 'FC Mobile 26 UTOTS Icons 104 OVR Dream Team',
        game: 'EA FC Mobile',
        price: 3600,
        originalPrice: 4500,
        images: [formationImg, superstarImg, heroImg],
        overallRating: 104,
        accountLevel: 78,
        platform: 'Mobile (Android/iOS)',
        region: 'Global',
        coinBalance: 82000,
        gpBalance: 125000000,
        players: ['R9 Ronaldo Icon 105', 'Gullit Prime 104', 'Zidane 103', 'Maldini 104', 'Viera 103', 'Buffon Icon 102'],
        rarePlayers: ['Prime Icon R9 105', 'Ruud Gullit 104', 'Paolo Maldini 104'],
        specialCards: ['UTOTS 11 Starters', '15 Ranked Red Ranks', '9 Mascherano Rankups left'],
        description: 'Ranked FIFA Mobile / FC Mobile account with all maxed skill boosts. EA Account with clean login, no bans, instant transfer upon order confirmation.',
        status: 'available',
        featured: true,
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fid-103',
        title: 'Epic Ronaldinho + Cruyff + 12000 Unspent Coins Account',
        game: 'eFootball 2026',
        price: 2900,
        originalPrice: 3500,
        images: [superstarImg, heroImg, formationImg],
        overallRating: 99,
        accountLevel: 62,
        platform: 'Mobile (Android/iOS)',
        region: 'Global',
        coinBalance: 12400,
        gpBalance: 2100000,
        players: ['Ronaldinho Gaúcho (Booster)', 'Johan Cruyff (Epic)', 'Neymar Jr (Santos)', 'Casemiro (Anchor)', 'Nesta (Epic)'],
        rarePlayers: ['Ronaldinho 101 Booster', 'Cruyff 100 Epic'],
        specialCards: ['12,400 Raw Coins ready to spin upcoming packs', '8 Epics'],
        description: 'Huge coin reserve ready for any upcoming event! Includes top tier dribblers and legendary Konami ID with zero strikes.',
        status: 'available',
        featured: false,
        createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fid-104',
        title: 'PC Steam eFootball Legend Squad 101 OVR',
        game: 'eFootball 2026',
        price: 5200,
        originalPrice: 6500,
        images: [formationImg, heroImg, superstarImg],
        overallRating: 101,
        accountLevel: 105,
        platform: 'PC (Steam)',
        region: 'Global',
        coinBalance: 1800,
        gpBalance: 5900000,
        players: ['Cristiano Ronaldo (Manchester United Epic)', 'L. Messi', 'P. Vieira', 'F. Beckenbauer', 'P. Čech'],
        rarePlayers: ['Man United CR7 Booster', 'Patrick Vieira Epic Destroyer'],
        specialCards: ['Full Steam Account Handover', 'Original Email Included'],
        description: 'Full original Steam account with eFootball 2026 maxed out squad. Full access with first registered CD-key details provided.',
        status: 'sold',
        featured: false,
        createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'fid-105',
        title: 'Starter God Squad: 98 OVR + 5,000 Coins Instant Delivery',
        game: 'eFootball 2026',
        price: 1450,
        originalPrice: 1900,
        images: [superstarImg, formationImg],
        overallRating: 98,
        accountLevel: 35,
        platform: 'Mobile (Android/iOS)',
        region: 'Global / Asia',
        coinBalance: 5120,
        gpBalance: 1100000,
        players: ['K. Mbappé (Show Time)', 'J. Bellingham (Highlight)', 'Rodri', 'A. Davies', 'Alisson Becker'],
        rarePlayers: ['Show Time Mbappé', 'Epic Kaka'],
        specialCards: ['7 Epic Cards', '5,120 Coins'],
        description: 'Budget-friendly powerhouse squad. Great for division climbing and immediate competitive play.',
        status: 'available',
        featured: true,
        createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    coinPackages: [
      {
        id: 'cp-1000',
        coinAmount: 1000,
        price: 250,
        originalPrice: 300,
        discount: 17,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'Instant top-up via Player ID & Konami server sync. 10 - 20 mins delivery.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cp-5000',
        coinAmount: 5000,
        price: 1150,
        originalPrice: 1350,
        discount: 15,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'Fast delivery guaranteed. Safe server top-up without password sharing.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cp-10000',
        coinAmount: 10000,
        price: 2190,
        originalPrice: 2600,
        discount: 16,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'Best value for pack opening events. Direct credit into in-game mailbox.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cp-25000',
        coinAmount: 25000,
        price: 5200,
        originalPrice: 6200,
        discount: 16,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'VIP Priority delivery within 15 minutes. 100% Ban-Free guarantee.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cp-50000',
        coinAmount: 50000,
        price: 9900,
        originalPrice: 12000,
        discount: 18,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'Mega booster bundle. 24/7 priority live support and transaction protection.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'cp-100000',
        coinAmount: 100000,
        price: 18900,
        originalPrice: 23500,
        discount: 20,
        game: 'eFootball 2026',
        platform: 'All Platforms (Mobile / PC / Console)',
        deliveryInfo: 'Wholesale tier package for serious pro streamers & squad builders.',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    orders: [
      {
        id: 'ORD-89214',
        userId: 'usr-buyer-02',
        orderType: 'ID',
        footballId: 'fid-104',
        footballIdTitle: 'PC Steam eFootball Legend Squad 101 OVR',
        price: 5200,
        customerName: 'Rahim Khan',
        email: 'buyer@footballstore.com',
        phone: '+880 1812-999888',
        paymentMethod: 'bKash',
        paymentTransactionId: 'BKASH9X01492K',
        note: 'Please send login details to my verified WhatsApp.',
        status: 'delivered',
        createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      },
      {
        id: 'ORD-89215',
        userId: 'usr-buyer-02',
        orderType: 'COINS',
        coinPackageId: 'cp-10000',
        coinAmount: 10000,
        price: 2190,
        playerID: 'EF-9482-1049',
        customerName: 'Rahim Khan',
        email: 'buyer@footballstore.com',
        phone: '+880 1812-999888',
        paymentMethod: 'Nagad',
        paymentTransactionId: 'NAGAD7720912',
        note: 'eFootball Asia Region account',
        status: 'processing',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
    reviews: [
      {
        id: 'rev-01',
        userId: 'usr-buyer-02',
        userName: 'Rahim Khan',
        product: 'Big Time Messi 103 Account',
        rating: 5,
        comment: 'Alhamdulillah! Got the Konami ID and password in 10 minutes after bKash payment. Squad was exactly as described with 102 OVR.',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'rev-02',
        userId: 'usr-buyer-03',
        userName: 'Tanvir Hossain',
        product: '50,000 Coins Package',
        rating: 5,
        comment: 'Super fast coin top-up without any password required. Safe and trusted service for Bangladeshi gamers.',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'rev-03',
        userId: 'usr-buyer-04',
        userName: 'Sakib Al Mahmud',
        product: 'FC Mobile 26 Icons Team',
        rating: 5,
        comment: '100% trusted seller. The Mascheranos and R9 card are insane in Head-to-Head mode!',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
    settings: {
      paymentNumberBkash: '+880 1712-345678',
      paymentNumberNagad: '+880 1812-345678',
      bankDetails: 'City Bank Ltd | A/C: 1102938475001 | Branch: Gulshan 2, Dhaka',
      paymentInstructions: '1. Send Money (Personal) to our official bKash or Nagad number.\n2. Keep your Transaction ID (TrxID) handy.\n3. Enter the TrxID and your phone number in the checkout form.\n4. Our team verifies payments and fulfills orders within 15–30 minutes.',
      supportWhatsapp: '+880 1712-345678',
      supportFacebook: 'https://facebook.com/footballidstore',
      supportEmail: 'support@footballidstore.com',
      supportPhone: '+880 1912-345678',
      faqs: [
        {
          question: 'How do I buy a football game ID?',
          answer: 'Browse our Football IDs section, select your desired account, review the squad formation, OVR, and player list, then click "Buy This ID". You will submit payment via bKash, Nagad, or Bank Transfer. After payment verification, our admin transfers complete credentials (Konami ID / EA account) directly to your contact.',
        },
        {
          question: 'How do I buy coins?',
          answer: 'Navigate to "Buy Coins", choose a package (e.g. 1,000, 10,000, or 50,000 Coins), enter your Game ID / Player ID, select your payment method, and complete the order. Coins are safely credited directly to your account.',
        },
        {
          question: 'How long does delivery take?',
          answer: 'Coin top-ups are usually processed in 10 to 30 minutes. Football ID account transfers take between 15 to 45 minutes during operational hours (9:00 AM - 1:00 AM BST).',
        },
        {
          question: 'What payment methods are available?',
          answer: 'We support all major Bangladeshi mobile banking channels including bKash (Personal/Merchant), Nagad (Personal), and direct Bank Transfers. Manual transaction verification protects both buyer and seller.',
        },
        {
          question: 'How do I provide my Player ID?',
          answer: 'In eFootball or FC Mobile, tap your User Profile / Extras menu to copy your 9-10 digit User ID / Player ID. Paste that exact string into our Coin checkout form.',
        },
        {
          question: 'Can I get a refund?',
          answer: 'If an ID is no longer available or an order cannot be delivered within 2 hours, we issue an instant 100% money-back refund to your original payment number.',
        },
      ],
    },
    contactMessages: [
      {
        id: 'msg-01',
        name: 'Farhan Ahmed',
        email: 'farhan@example.com',
        phone: '+880 1612-445566',
        subject: 'Query regarding PC Steam Account Transfer',
        message: 'Hi, does the PC account include the original Steam email change confirmation?',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
    ],
  };
}

let memoryDb: DatabaseState = getInitialData();

export function getDatabase(): DatabaseState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryDb = {
        ...getInitialData(),
        ...parsed,
      };
      return memoryDb;
    } catch {
      saveDatabase(memoryDb);
      return memoryDb;
    }
  } else {
    saveDatabase(memoryDb);
    return memoryDb;
  }
}

export function saveDatabase(data: DatabaseState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    memoryDb = data;
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

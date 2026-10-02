export interface IUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface IFootballID {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface ICoinPackage {
  id: string;
  coinAmount: number;
  price: number;
  originalPrice: number;
  discount?: number;
  game: string;
  platform: string;
  deliveryInfo: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'payment_submitted'
  | 'confirmed'
  | 'processing'
  | 'delivered'
  | 'cancelled';

export interface IOrder {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  id: string;
  userId: string;
  userName: string;
  product: string;
  orderId?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending';
  createdAt: string;
}

export interface ISiteSettings {
  paymentNumberBkash: string;
  paymentNumberNagad: string;
  bankDetails: string;
  paymentInstructions: string;
  supportWhatsapp: string;
  supportFacebook: string;
  supportEmail: string;
  supportPhone: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

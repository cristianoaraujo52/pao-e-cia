
export type ProductCategory = 'pães' | 'doces' | 'bebidas' | 'salgados';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  rating: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  block?: string;
  apartment?: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export interface Resident {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  block: '1' | '2' | '3' | '4';
  apartment: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderBlock?: string;
  senderApartment?: string;
  content: string;
  isFromAdmin: boolean;
  recipientId?: string;
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export enum Page {
  HOME = 'home',
  LOGIN = 'login',
  REGISTER = 'register',
  CHECKOUT = 'checkout',
  TRACKING = 'tracking',
  PROFILE = 'profile',
  ADMIN = 'admin',
  REPORTS = 'reports',
  CHAT = 'chat'
}

export type PaymentMethodType = 'pix' | 'card' | 'cash' | 'monthly';

export interface DeliveryAddress {
  block: '1' | '2' | '3' | '4';
  apartment: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethodType;
  deliveryAddress: DeliveryAddress;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

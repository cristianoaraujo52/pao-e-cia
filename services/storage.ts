
import { Product, Order } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'paoecia_products',
  ORDERS: 'paoecia_orders',
  SETTINGS: 'paoecia_settings',
};

// Products
export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const loadProducts = (): Product[] | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : null;
};

// Orders
export const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const loadOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : [];
};

export const addOrder = (order: Order): void => {
  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);
};

// Settings
export interface StoreSettings {
  storeName: string;
  condominiumName: string;
  blocks: string[];
  paymentMethods: {
    pix: boolean;
    card: boolean;
    cash: boolean;
    monthly: boolean;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Pão e Cia',
  condominiumName: 'Bourgogne',
  blocks: ['1', '2', '3', '4'],
  paymentMethods: {
    pix: true,
    card: true,
    cash: true,
    monthly: true,
  },
};

export const saveSettings = (settings: StoreSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = (): StoreSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

// Image utilities
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

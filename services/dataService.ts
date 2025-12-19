
import { Purchase, Sale, UserSettings, User } from '../types';

const STORAGE_KEYS = {
  PURCHASES: 'cmv_pro_purchases',
  SALES: 'cmv_pro_sales',
  SETTINGS: 'cmv_pro_settings',
  USERS: 'cmv_pro_users'
};

// Initialize with a few mock users if empty
const initData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'super@gmail.com',
      password: '12345678',
      company: 'CMV Pro HQ',
      phone: '11999999999',
      role: 'admin'
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
  }
};

initData();

export const dataService = {
  // Purchases
  getPurchases: (userId: string): Purchase[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    const all = data ? JSON.parse(data) : [];
    return all.filter((p: Purchase) => p.userId === userId);
  },
  addPurchase: (purchase: Purchase) => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    const all = data ? JSON.parse(data) : [];
    all.push(purchase);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(all));
  },
  deletePurchase: (id: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    const all = data ? JSON.parse(data) : [];
    const filtered = all.filter((p: Purchase) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(filtered));
  },

  // Sales
  getSales: (userId: string): Sale[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    const all = data ? JSON.parse(data) : [];
    return all.filter((s: Sale) => s.userId === userId);
  },
  addSale: (sale: Sale) => {
    const data = localStorage.getItem(STORAGE_KEYS.SALES);
    const all = data ? JSON.parse(data) : [];
    all.push(sale);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(all));
  },

  // Settings
  getSettings: (userId: string): UserSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const all = data ? JSON.parse(data) : [];
    const found = all.find((s: UserSettings) => s.userId === userId);
    return found || { userId, salesGoal: 50000, cmvTarget: 30 };
  },
  updateSettings: (settings: UserSettings) => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const all = data ? JSON.parse(data) : [];
    const index = all.findIndex((s: UserSettings) => s.userId === settings.userId);
    if (index >= 0) {
      all[index] = settings;
    } else {
      all.push(settings);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(all));
  },

  // Admin User Management
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  addUser: (user: User) => {
    const users = dataService.getUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
};

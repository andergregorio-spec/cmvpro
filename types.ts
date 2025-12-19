
export type Category = 'comida' | 'bebida';

export interface Purchase {
  id: string;
  userId: string;
  category: Category;
  product: string;
  date: string;
  value: number;
}

export interface Sale {
  id: string;
  userId: string;
  date: string;
  value: number;
}

export interface UserSettings {
  userId: string;
  salesGoal: number;
  cmvTarget: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  company: string;
  phone: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type UserId = 'user_1' | 'user_2';

export interface UserProfile {
  id: UserId;
  name: string;
  avatarColor: string; // e.g., 'sky' or 'rose'
  emoji: string;
  pin?: string; // Optional 4 digit PIN
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  subcategories: string[];
  isSystem?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  paid_by: UserId;
  category_id: string;
  subcategory: string;
  country?: string; // Destination/country for trips
  date: string; // ISO date 'YYYY-MM-DD'
  note?: string;
  is_settled: boolean;
  settlement_id?: string | null;
  created_at: string;
}

export interface Settlement {
  id: string;
  date: string;
  amount: number;
  from_user: UserId;
  to_user: UserId;
  note?: string;
  settled_expense_ids: string[];
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  configured: boolean;
}

export type ActiveTab = 'dashboard' | 'transactions' | 'add' | 'trips' | 'settings';

export type UserId = 'user_1' | 'user_2';

export interface UserProfile {
  id: UserId;
  name: string;
  avatarColor: string; // e.g., 'sky' or 'rose'
  emoji: string;
  pin?: string; // Optional 4 digit PIN
}

export type EventType = 'trip' | 'dates' | 'renovation' | 'household' | 'other';

export interface AppEvent {
  id: string;
  name: string;
  type: EventType;
  emoji: string;
  color: string;
  description?: string;
  destination_country?: string; // Country for trip
  currency: string; // e.g. 'EUR', 'CZK', 'JPY', 'PLN', 'USD'
  currency_symbol: string; // e.g. '€', 'Kč', '¥', 'zł', '$'
  exchange_rate_to_eur?: number; // e.g. 25.2 CZK per EUR
  target_budget?: number;
  status: 'active' | 'closed'; // 'active' = otvorený zber, 'closed' = ukončený zber
  created_at: string;
  updated_at?: string;
  closed_at?: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  subcategories: string[];
  isSystem?: boolean;
  defaultEventType?: EventType;
}

export interface Expense {
  id: string;
  amount: number; // Stored in EUR for consistent totals & 50/50 balance
  original_amount?: number; // In local currency if different from EUR
  currency?: string; // e.g. 'CZK'
  currency_symbol?: string; // e.g. 'Kč'
  exchange_rate?: number;
  paid_by: UserId;
  event_id: string; // ID of the event/project
  category_id: string;
  subcategory: string;
  item_title?: string; // Čo to bolo
  note?: string; // Komentár k tomu
  country?: string;
  date: string; // 'YYYY-MM-DD'
  is_settled: boolean;
  settlement_id?: string | null;
  created_at: string;
  updated_at?: string; // Dátová pečiatka zmeny
}

export interface Settlement {
  id: string;
  date: string;
  amount: number;
  from_user: UserId;
  to_user: UserId;
  event_id?: string;
  note?: string;
  settled_expense_ids: string[];
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  configured: boolean;
}

export type ActiveTab = 'events' | 'transactions' | 'add' | 'categories' | 'settings';

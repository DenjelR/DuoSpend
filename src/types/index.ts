export type UserId = 'user_1' | 'user_2';

export interface UserProfile {
  id: UserId;
  name: string;
  avatarColor: string; // e.g., 'sky' or 'rose'
  emoji: string;
  pin?: string; // Optional 4 digit PIN
}

export type EventType = 'trip' | 'renovation' | 'dates' | 'other';

export interface AppEvent {
  id: string;
  name: string;
  type: EventType;
  emoji: string;
  color: string;
  description?: string;
  destination?: string; // for trips
  target_budget?: number;
  created_at: string;
  updated_at?: string;
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
  amount: number;
  paid_by: UserId;
  event_id: string; // ID of the event/project (Prerábka bytu, Výlet do Talianska, etc.)
  category_id: string;
  subcategory: string;
  item_title?: string; // Čo to bolo (napr. "Obkladačky do kúpeľne", "Večera pri sviečkach")
  note?: string; // Komentár / poznámka k výdavku
  country?: string; // Krajina / mesto
  date: string; // 'YYYY-MM-DD'
  is_settled: boolean;
  settlement_id?: string | null;
  created_at: string;
  updated_at?: string; // Dátová pečiatka zmeny / poslednej úpravy
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

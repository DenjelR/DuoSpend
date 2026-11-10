import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  Category,
  Expense,
  Settlement,
  UserProfile,
  UserId,
  AppEvent,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PROFILES,
  SAMPLE_EXPENSES,
  DEFAULT_EVENTS,
} from '../lib/defaultData';
import {
  getSupabaseClient,
  getSupabaseCredentials,
} from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile;
  otherUser: UserProfile;
  profiles: UserProfile[];
  setCurrentUserId: (id: UserId) => void;
  updateProfile: (id: UserId, data: Partial<UserProfile>) => Promise<void>;
  
  isPinLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  
  events: AppEvent[];
  openEvents: AppEvent[];
  closedEvents: AppEvent[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  addEvent: (event: Omit<AppEvent, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: 'active' | 'closed' }) => Promise<AppEvent>;
  updateEvent: (id: string, updates: Partial<AppEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  closeEvent: (id: string) => Promise<void>;
  reopenEvent: (id: string) => Promise<void>;

  expenses: Expense[];
  categories: Category[];
  settlements: Settlement[];
  
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'is_settled' | 'settlement_id'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  settleBalance: (amount: number, fromUser: UserId, toUser: UserId, expenseIds: string[], eventId?: string) => Promise<void>;
  resetAllData: () => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (exp: Expense | null) => void;
  preselectedEventIdForAdd: string | null;
  setPreselectedEventIdForAdd: (id: string | null) => void;
  
  supabaseStatus: {
    isConfigured: boolean;
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: string | null;
    error: string | null;
  };
  refreshSupabaseSync: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  CURRENT_USER_ID: 'duospend_current_user_id',
  PROFILES: 'duospend_profiles_v3',
  EVENTS: 'duospend_events_v3',
  EXPENSES: 'duospend_expenses_v3',
  CATEGORIES: 'duospend_categories_v3',
  SETTLEMENTS: 'duospend_settlements_v3',
  THEME: 'duospend_theme',
  SELECTED_EVENT_ID: 'duospend_selected_event_id_v3',
  PURGED_FLAG: 'duospend_purged_for_danko_simonka_v3',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check and purge legacy sample data for Danko & Simonka clean start
  if (typeof window !== 'undefined' && !localStorage.getItem(LOCAL_STORAGE_KEYS.PURGED_FLAG)) {
    localStorage.removeItem('duospend_expenses');
    localStorage.removeItem('duospend_profiles');
    localStorage.removeItem('duospend_events');
    localStorage.removeItem('duospend_settlements');
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(DEFAULT_PROFILES));
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PURGED_FLAG, 'true');
  }

  // 1. Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // 2. Profiles State (Danko & Simonka)
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch {}
    }
    return DEFAULT_PROFILES;
  });

  const [currentUserId, setCurrentUserIdState] = useState<UserId>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID) as UserId;
    return saved === 'user_2' ? 'user_2' : 'user_1';
  });

  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);

  // 3. Events State
  const [events, setEvents] = useState<AppEvent[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EVENTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_EVENTS;
  });

  const [selectedEventId, setSelectedEventIdState] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_EVENT_ID);
    return saved || 'event_prerabka';
  });

  const setSelectedEventId = (id: string) => {
    setSelectedEventIdState(id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_EVENT_ID, id);
  };

  // 4. Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('events');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [preselectedEventIdForAdd, setPreselectedEventIdForAdd] = useState<string | null>(null);

  // 5. Data State (Expenses initialized to EMPTY [])
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.EXPENSES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTLEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // 6. Supabase Sync Status
  const [supabaseStatus, setSupabaseStatus] = useState({
    isConfigured: false,
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null as string | null,
    error: null as string | null,
  });

  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0];
  const otherUser = profiles.find((p) => p.id !== currentUserId) || profiles[1];

  const openEvents = events.filter((ev) => ev.status !== 'closed');
  const closedEvents = events.filter((ev) => ev.status === 'closed');

  // Helper to persist to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  // Set Current User with optional PIN
  const setCurrentUserId = (id: UserId) => {
    const target = profiles.find((p) => p.id === id);
    if (target?.pin && target.pin.trim().length === 4) {
      setCurrentUserIdState(id);
      setIsPinLocked(true);
    } else {
      setCurrentUserIdState(id);
      setIsPinLocked(false);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, id);
    }
  };

  const unlockWithPin = (enteredPin: string): boolean => {
    const user = profiles.find((p) => p.id === currentUserId);
    if (!user?.pin || user.pin === enteredPin) {
      setIsPinLocked(false);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    const user = profiles.find((p) => p.id === currentUserId);
    if (user?.pin) {
      setIsPinLocked(true);
    }
  };

  const updateProfile = async (id: UserId, data: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('profiles').upsert({
          id,
          ...data,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Nepodarilo sa uložiť profil do Supabase:', err);
      }
    }
  };

  // Events CRUD
  const addEvent = async (
    eventData: Omit<AppEvent, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: 'active' | 'closed' }
  ): Promise<AppEvent> => {
    const newEvent: AppEvent = {
      ...eventData,
      status: eventData.status || 'active',
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('events').insert({
          id: newEvent.id,
          name: newEvent.name,
          type: newEvent.type,
          emoji: newEvent.emoji,
          color: newEvent.color,
          description: newEvent.description || null,
          destination_country: newEvent.destination_country || null,
          currency: newEvent.currency,
          currency_symbol: newEvent.currency_symbol,
          exchange_rate_to_eur: newEvent.exchange_rate_to_eur || 1,
          target_budget: newEvent.target_budget || null,
          status: newEvent.status,
          created_at: newEvent.created_at,
          updated_at: newEvent.updated_at,
        });
      } catch (err) {
        console.warn('Chyba ukladania eventu do Supabase:', err);
      }
    }
    return newEvent;
  };

  const updateEvent = async (id: string, updates: Partial<AppEvent>) => {
    const updatedTimestamp = new Date().toISOString();
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updates, updated_at: updatedTimestamp } : ev))
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('events').update({
          ...updates,
          updated_at: updatedTimestamp,
        }).eq('id', id);
      } catch (err) {
        console.warn('Chyba aktualizácie eventu v Supabase:', err);
      }
    }
  };

  // Close Event (Ukončiť zber výdavkov)
  const closeEvent = async (id: string) => {
    const closedTimestamp = new Date().toISOString();
    await updateEvent(id, {
      status: 'closed',
      closed_at: closedTimestamp,
    });
  };

  // Re-open Event (Znovu otvoriť zber)
  const reopenEvent = async (id: string) => {
    await updateEvent(id, {
      status: 'active',
      closed_at: undefined,
    });
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setExpenses((prev) => prev.filter((exp) => exp.event_id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('events').delete().eq('id', id);
        await client.from('expenses').delete().eq('event_id', id);
      } catch (err) {
        console.warn('Chyba mazania eventu v Supabase:', err);
      }
    }
  };

  // Synchronize data from Supabase
  const refreshSupabaseSync = useCallback(async () => {
    const creds = getSupabaseCredentials();
    const client = getSupabaseClient();

    setSupabaseStatus((prev) => ({
      ...prev,
      isConfigured: creds.isConfigured,
      isSyncing: !!client,
      error: null,
    }));

    if (!client) {
      setSupabaseStatus((prev) => ({
        ...prev,
        isConfigured: false,
        isSyncing: false,
      }));
      return;
    }

    try {
      // 1. Fetch Events
      const { data: evData } = await client.from('events').select('*').order('created_at', { ascending: false });
      if (evData && evData.length > 0) {
        const formattedEvents: AppEvent[] = evData.map((e: any) => ({
          id: e.id,
          name: e.name,
          type: e.type,
          emoji: e.emoji,
          color: e.color,
          description: e.description || undefined,
          destination_country: e.destination_country || undefined,
          currency: e.currency || 'EUR',
          currency_symbol: e.currency_symbol || '€',
          exchange_rate_to_eur: e.exchange_rate_to_eur ? Number(e.exchange_rate_to_eur) : 1,
          target_budget: e.target_budget ? Number(e.target_budget) : undefined,
          status: (e.status as 'active' | 'closed') || 'active',
          created_at: e.created_at,
          updated_at: e.updated_at || undefined,
          closed_at: e.closed_at || undefined,
        }));
        setEvents(formattedEvents);
      }

      // 2. Fetch Expenses
      const { data: expData, error: expErr } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expErr) throw expErr;

      if (expData) {
        const formatted: Expense[] = expData.map((item: any) => ({
          id: item.id,
          amount: Number(item.amount),
          original_amount: item.original_amount ? Number(item.original_amount) : undefined,
          currency: item.currency || 'EUR',
          currency_symbol: item.currency_symbol || '€',
          exchange_rate: item.exchange_rate ? Number(item.exchange_rate) : 1,
          paid_by: item.paid_by as UserId,
          event_id: item.event_id || events[0]?.id || 'event_prerabka',
          category_id: item.category_id,
          subcategory: item.subcategory,
          item_title: item.item_title || undefined,
          note: item.note || undefined,
          country: item.country || undefined,
          date: item.date,
          is_settled: Boolean(item.is_settled),
          settlement_id: item.settlement_id || null,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || undefined,
        }));
        setExpenses(formatted);
      }

      // 3. Fetch Categories
      const { data: catData } = await client.from('categories').select('*');
      if (catData && catData.length > 0) {
        const formattedCats: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          iconName: c.icon_name || 'Tag',
          color: c.color,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
          isSystem: Boolean(c.is_system),
          defaultEventType: c.default_event_type || undefined,
        }));
        setCategories(formattedCats);
      }

      // 4. Fetch Settlements
      const { data: setmData } = await client.from('settlements').select('*').order('date', { ascending: false });
      if (setmData && setmData.length > 0) {
        const formattedSetm: Settlement[] = setmData.map((s: any) => ({
          id: s.id,
          date: s.date,
          amount: Number(s.amount),
          from_user: s.from_user as UserId,
          to_user: s.to_user as UserId,
          event_id: s.event_id || undefined,
          note: s.note || '',
          settled_expense_ids: Array.isArray(s.settled_expense_ids) ? s.settled_expense_ids : [],
          created_at: s.created_at || new Date().toISOString(),
        }));
        setSettlements(formattedSetm);
      }

      setSupabaseStatus((prev) => ({
        ...prev,
        isConfigured: true,
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }),
        error: null,
      }));
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      setSupabaseStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Chyba synchronizácie',
      }));
    }
  }, [events]);

  // Initial Sync & Realtime listeners
  useEffect(() => {
    refreshSupabaseSync();

    const client = getSupabaseClient();
    if (!client) return;

    const channel = client
      .channel('duospend_realtime_events_v3')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const newExp: Expense = {
            id: payload.new.id,
            amount: Number(payload.new.amount),
            original_amount: payload.new.original_amount ? Number(payload.new.original_amount) : undefined,
            currency: payload.new.currency || 'EUR',
            currency_symbol: payload.new.currency_symbol || '€',
            exchange_rate: payload.new.exchange_rate ? Number(payload.new.exchange_rate) : 1,
            paid_by: payload.new.paid_by,
            event_id: payload.new.event_id,
            category_id: payload.new.category_id,
            subcategory: payload.new.subcategory,
            item_title: payload.new.item_title || undefined,
            note: payload.new.note || undefined,
            country: payload.new.country || undefined,
            date: payload.new.date,
            is_settled: Boolean(payload.new.is_settled),
            settlement_id: payload.new.settlement_id || null,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at || undefined,
          };
          setExpenses((prev) => {
            if (prev.some((e) => e.id === newExp.id)) return prev;
            return [newExp, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedExp: Expense = {
            id: payload.new.id,
            amount: Number(payload.new.amount),
            original_amount: payload.new.original_amount ? Number(payload.new.original_amount) : undefined,
            currency: payload.new.currency || 'EUR',
            currency_symbol: payload.new.currency_symbol || '€',
            exchange_rate: payload.new.exchange_rate ? Number(payload.new.exchange_rate) : 1,
            paid_by: payload.new.paid_by,
            event_id: payload.new.event_id,
            category_id: payload.new.category_id,
            subcategory: payload.new.subcategory,
            item_title: payload.new.item_title || undefined,
            note: payload.new.note || undefined,
            country: payload.new.country || undefined,
            date: payload.new.date,
            is_settled: Boolean(payload.new.is_settled),
            settlement_id: payload.new.settlement_id || null,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at || undefined,
          };
          setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
        } else if (payload.eventType === 'DELETE') {
          setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        refreshSupabaseSync();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [refreshSupabaseSync]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setSupabaseStatus((s) => ({ ...s, isOnline: true }));
    const handleOffline = () => setSupabaseStatus((s) => ({ ...s, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // CRUD Operations for Expenses
  const addExpense = async (
    data: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'is_settled' | 'settlement_id'>
  ): Promise<Expense> => {
    const nowTimestamp = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      is_settled: false,
      settlement_id: null,
      created_at: nowTimestamp,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('expenses').insert({
          id: newExpense.id,
          amount: newExpense.amount,
          original_amount: newExpense.original_amount || null,
          currency: newExpense.currency || 'EUR',
          currency_symbol: newExpense.currency_symbol || '€',
          exchange_rate: newExpense.exchange_rate || 1,
          paid_by: newExpense.paid_by,
          event_id: newExpense.event_id,
          category_id: newExpense.category_id,
          subcategory: newExpense.subcategory,
          item_title: newExpense.item_title || null,
          note: newExpense.note || null,
          country: newExpense.country || null,
          date: newExpense.date,
          is_settled: false,
          settlement_id: null,
          created_at: newExpense.created_at,
          updated_at: null,
        });
      } catch (err) {
        console.warn('Chyba ukladania do Supabase:', err);
      }
    }

    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const updateTimestamp = new Date().toISOString();

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updated_at: updateTimestamp } : e
      )
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = {
          ...updates,
          updated_at: updateTimestamp,
        };
        if (payload.country === undefined) payload.country = null;
        if (payload.note === undefined) payload.note = null;
        if (payload.item_title === undefined) payload.item_title = null;
        await client.from('expenses').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Chyba aktualizácie v Supabase:', err);
      }
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('expenses').delete().eq('id', id);
      } catch (err) {
        console.warn('Chyba mazania v Supabase:', err);
      }
    }
  };

  // Categories CRUD
  const addCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = {
      ...category,
      id: 'cat_' + Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('categories').insert({
          id: newCat.id,
          name: newCat.name,
          icon_name: newCat.iconName,
          color: newCat.color,
          subcategories: newCat.subcategories,
          is_system: false,
          default_event_type: newCat.defaultEventType || null,
        });
      } catch (err) {
        console.warn('Chyba ukladania kategorie do Supabase:', err);
      }
    }
    return newCat;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.iconName !== undefined) payload.icon_name = updates.iconName;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.subcategories !== undefined) payload.subcategories = updates.subcategories;
        if (updates.defaultEventType !== undefined) payload.default_event_type = updates.defaultEventType;
        await client.from('categories').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Chyba aktualizácie kategorie v Supabase:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Chyba mazania kategorie v Supabase:', err);
      }
    }
  };

  // Settlement action
  const settleBalance = async (
    amount: number,
    fromUser: UserId,
    toUser: UserId,
    expenseIds: string[],
    eventId?: string
  ) => {
    const newSettlement: Settlement = {
      id: 'setm_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount,
      from_user: fromUser,
      to_user: toUser,
      event_id: eventId,
      settled_expense_ids: expenseIds,
      created_at: new Date().toISOString(),
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    setExpenses((prev) =>
      prev.map((e) =>
        expenseIds.includes(e.id)
          ? { ...e, is_settled: true, settlement_id: newSettlement.id }
          : e
      )
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('settlements').insert({
          id: newSettlement.id,
          date: newSettlement.date,
          amount: newSettlement.amount,
          from_user: newSettlement.from_user,
          to_user: newSettlement.to_user,
          event_id: eventId || null,
          settled_expense_ids: newSettlement.settled_expense_ids,
          created_at: newSettlement.created_at,
        });

        if (expenseIds.length > 0) {
          await client
            .from('expenses')
            .update({ is_settled: true, settlement_id: newSettlement.id })
            .in('id', expenseIds);
        }
      } catch (err) {
        console.warn('Chyba vyrovnania v Supabase:', err);
      }
    }
  };

  // Reset all data completely
  const resetAllData = () => {
    setExpenses([]);
    setSettlements([]);
    setEvents(DEFAULT_EVENTS);
    setProfiles(DEFAULT_PROFILES);
    setCategories(DEFAULT_CATEGORIES);
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTLEMENTS, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(DEFAULT_PROFILES));
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        otherUser,
        profiles,
        setCurrentUserId,
        updateProfile,
        isPinLocked,
        unlockWithPin,
        lockApp,
        events,
        openEvents,
        closedEvents,
        selectedEventId,
        setSelectedEventId,
        addEvent,
        updateEvent,
        deleteEvent,
        closeEvent,
        reopenEvent,
        expenses,
        categories,
        settlements,
        activeTab,
        setActiveTab,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        updateCategory,
        deleteCategory,
        settleBalance,
        resetAllData,
        isDarkMode,
        toggleDarkMode,
        isAddModalOpen,
        setIsAddModalOpen,
        editingExpense,
        setEditingExpense,
        preselectedEventIdForAdd,
        setPreselectedEventIdForAdd,
        supabaseStatus,
        refreshSupabaseSync,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

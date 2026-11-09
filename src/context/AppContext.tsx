import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  Category,
  Expense,
  Settlement,
  UserProfile,
  UserId,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PROFILES,
  SAMPLE_EXPENSES,
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
  
  expenses: Expense[];
  categories: Category[];
  settlements: Settlement[];
  
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'is_settled' | 'settlement_id'>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  settleBalance: (amount: number, fromUser: UserId, toUser: UserId, expenseIds: string[]) => Promise<void>;
  
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (exp: Expense | null) => void;
  
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
  PROFILES: 'duospend_profiles',
  EXPENSES: 'duospend_expenses',
  CATEGORIES: 'duospend_categories',
  SETTLEMENTS: 'duospend_settlements',
  THEME: 'duospend_theme',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // 2. Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PROFILES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROFILES;
  });

  const [currentUserId, setCurrentUserIdState] = useState<UserId>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_USER_ID) as UserId;
    return saved === 'user_2' ? 'user_2' : 'user_1';
  });

  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);

  // 3. Navigation & Month Selection
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  // 4. Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // 5. Data State
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
    return SAMPLE_EXPENSES;
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

  // Current and Other user computed
  const currentUser = profiles.find((p) => p.id === currentUserId) || profiles[0];
  const otherUser = profiles.find((p) => p.id !== currentUserId) || profiles[1];

  // Helper to persist to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  // Set Current User with optional PIN protection
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
      // 1. Fetch Expenses
      const { data: expData, error: expErr } = await client
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expErr) throw expErr;

      if (expData && expData.length > 0) {
        const formatted: Expense[] = expData.map((item: any) => ({
          id: item.id,
          amount: Number(item.amount),
          paid_by: item.paid_by as UserId,
          category_id: item.category_id,
          subcategory: item.subcategory,
          country: item.country || undefined,
          date: item.date,
          note: item.note || undefined,
          is_settled: Boolean(item.is_settled),
          settlement_id: item.settlement_id || null,
          created_at: item.created_at || new Date().toISOString(),
        }));
        setExpenses(formatted);
      } else if (expenses.length > 0) {
        // Seed Supabase if table is currently empty
        const recordsToInsert = expenses.map((e) => ({
          id: e.id,
          amount: e.amount,
          paid_by: e.paid_by,
          category_id: e.category_id,
          subcategory: e.subcategory,
          country: e.country || null,
          date: e.date,
          note: e.note || null,
          is_settled: e.is_settled,
          settlement_id: e.settlement_id || null,
          created_at: e.created_at,
        }));
        await client.from('expenses').upsert(recordsToInsert);
      }

      // 2. Fetch Categories
      const { data: catData } = await client.from('categories').select('*');
      if (catData && catData.length > 0) {
        const formattedCats: Category[] = catData.map((c: any) => ({
          id: c.id,
          name: c.name,
          iconName: c.icon_name || 'Tag',
          color: c.color,
          subcategories: Array.isArray(c.subcategories) ? c.subcategories : [],
          isSystem: Boolean(c.is_system),
        }));
        setCategories(formattedCats);
      } else if (categories.length > 0) {
        const catInserts = categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon_name: c.iconName,
          color: c.color,
          subcategories: c.subcategories,
          is_system: c.isSystem ?? false,
        }));
        await client.from('categories').upsert(catInserts);
      }

      // 3. Fetch Settlements
      const { data: setmData } = await client.from('settlements').select('*').order('date', { ascending: false });
      if (setmData && setmData.length > 0) {
        const formattedSetm: Settlement[] = setmData.map((s: any) => ({
          id: s.id,
          date: s.date,
          amount: Number(s.amount),
          from_user: s.from_user as UserId,
          to_user: s.to_user as UserId,
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
  }, [expenses, categories]);

  // Initial Sync and Realtime Channel Setup
  useEffect(() => {
    refreshSupabaseSync();

    const client = getSupabaseClient();
    if (!client) return;

    // Real-time channel for expenses and settlements
    const channel = client
      .channel('duospend_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newExp: Expense = {
              id: payload.new.id,
              amount: Number(payload.new.amount),
              paid_by: payload.new.paid_by,
              category_id: payload.new.category_id,
              subcategory: payload.new.subcategory,
              country: payload.new.country || undefined,
              date: payload.new.date,
              note: payload.new.note || undefined,
              is_settled: Boolean(payload.new.is_settled),
              settlement_id: payload.new.settlement_id || null,
              created_at: payload.new.created_at,
            };
            setExpenses((prev) => {
              if (prev.some((e) => e.id === newExp.id)) return prev;
              return [newExp, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedExp: Expense = {
              id: payload.new.id,
              amount: Number(payload.new.amount),
              paid_by: payload.new.paid_by,
              category_id: payload.new.category_id,
              subcategory: payload.new.subcategory,
              country: payload.new.country || undefined,
              date: payload.new.date,
              note: payload.new.note || undefined,
              is_settled: Boolean(payload.new.is_settled),
              settlement_id: payload.new.settlement_id || null,
              created_at: payload.new.created_at,
            };
            setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
          } else if (payload.eventType === 'DELETE') {
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlements' },
        () => {
          // Re-fetch settlements on change
          refreshSupabaseSync();
        }
      )
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
    data: Omit<Expense, 'id' | 'created_at' | 'is_settled' | 'settlement_id'>
  ): Promise<Expense> => {
    const newExpense: Expense = {
      ...data,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      is_settled: false,
      settlement_id: null,
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    setExpenses((prev) => [newExpense, ...prev]);

    // Save to Supabase
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('expenses').insert({
          id: newExpense.id,
          amount: newExpense.amount,
          paid_by: newExpense.paid_by,
          category_id: newExpense.category_id,
          subcategory: newExpense.subcategory,
          country: newExpense.country || null,
          date: newExpense.date,
          note: newExpense.note || null,
          is_settled: false,
          settlement_id: null,
          created_at: newExpense.created_at,
        });
      } catch (err) {
        console.warn('Chyba ukladania do Supabase, ulozene lokalne:', err);
      }
    }

    return newExpense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = { ...updates };
        if (payload.country === undefined) payload.country = null;
        if (payload.note === undefined) payload.note = null;
        await client.from('expenses').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Chyba aktualizacie v Supabase:', err);
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
        await client.from('categories').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Chyba aktualizacie kategorie v Supabase:', err);
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

  // Settlement: Mark as settled / Balance reset
  const settleBalance = async (
    amount: number,
    fromUser: UserId,
    toUser: UserId,
    expenseIds: string[]
  ) => {
    const newSettlement: Settlement = {
      id: 'setm_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      amount,
      from_user: fromUser,
      to_user: toUser,
      settled_expense_ids: expenseIds,
      created_at: new Date().toISOString(),
    };

    setSettlements((prev) => [newSettlement, ...prev]);

    // Mark expenses as settled
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
        console.warn('Chyba zaznamenania vyrovnania v Supabase:', err);
      }
    }
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
        expenses,
        categories,
        settlements,
        activeTab,
        setActiveTab,
        selectedMonth,
        setSelectedMonth,
        addExpense,
        updateExpense,
        deleteExpense,
        addCategory,
        updateCategory,
        deleteCategory,
        settleBalance,
        isDarkMode,
        toggleDarkMode,
        isAddModalOpen,
        setIsAddModalOpen,
        editingExpense,
        setEditingExpense,
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

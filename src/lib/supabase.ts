import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Expense, Category, Settlement, UserProfile } from '../types';

// Retrieve credentials from Vite env or local storage override
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedCustom = localStorage.getItem('duospend_supabase_custom_config');
  if (storedCustom) {
    try {
      const parsed = JSON.parse(storedCustom);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, isConfigured: true };
      }
    } catch {
      // ignore
    }
  }

  const isConfigured = Boolean(envUrl && envKey && !envUrl.includes('your-project') && !envKey.includes('your-anon'));
  return {
    url: envUrl,
    anonKey: envKey,
    isConfigured,
  };
}

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  if (cachedClient && lastUrl === url && lastKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUrl = url;
    lastKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Chyba inicializácie Supabase klienta:', err);
    return null;
  }
}

// Test Supabase connection
export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string }> {
  try {
    const targetUrl = url || getSupabaseCredentials().url;
    const targetKey = key || getSupabaseCredentials().anonKey;

    if (!targetUrl || !targetKey) {
      return { success: false, message: 'Chýba Supabase URL alebo Anon kľúč.' };
    }

    const testClient = createClient(targetUrl, targetKey);
    // Simple ping to check if credentials are valid
    const { error } = await testClient.from('expenses').select('id').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, but connection is valid!
        return {
          success: true,
          message: 'Pripojenie k Supabase je úspešné! Tabuľky zatiaľ neboli vytvorené, použite SQL skript nižšie.',
        };
      }
      return { success: false, message: `Chyba pripojenia: ${error.message}` };
    }

    return { success: true, message: 'Úspešne pripojené k Supabase s funkčnými tabuľkami!' };
  } catch (err) {
    return { success: false, message: err instanceof Error ? err.message : 'Neznáma chyba pripojenia' };
  }
}

// Complete SQL script to set up all tables and realtime in Supabase SQL editor
export const SUPABASE_SQL_SETUP = `-- DUOSPEND: SQL SKRIPT PRE SUPABASE (Spustite v Supabase -> SQL Editor)

-- 1. Tabuľka výdavkov (expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    amount NUMERIC NOT NULL,
    paid_by TEXT NOT NULL,
    category_id TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    country TEXT,
    date DATE NOT NULL,
    note TEXT,
    is_settled BOOLEAN DEFAULT FALSE,
    settlement_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabuľka kategórií (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    color TEXT NOT NULL,
    subcategories JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabuľka vyrovnaní účtov (settlements)
CREATE TABLE IF NOT EXISTS public.settlements (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    from_user TEXT NOT NULL,
    to_user TEXT NOT NULL,
    note TEXT,
    settled_expense_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabuľka profilov páru (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_color TEXT NOT NULL,
    emoji TEXT NOT NULL,
    pin TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Povolenie RLS a verejný prístup (pre jednoduché párové zdieľanie cez anon kľúč)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Verejné politiky pre čítanie a zápis
CREATE POLICY "Public expenses access" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public categories access" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public settlements access" ON public.settlements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Zapnutie Realtime synchronizácie pre okamžité zmeny medzi mobilmi
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
`;

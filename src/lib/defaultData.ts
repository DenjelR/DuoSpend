import { Category, UserProfile, Expense } from '../types';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Ja',
    avatarColor: '#0284c7', // Sky Blue
    emoji: '🧔',
    pin: '',
  },
  {
    id: 'user_2',
    name: 'Partnerka',
    avatarColor: '#e11d48', // Rose Red
    emoji: '👩',
    pin: '',
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_domacnost',
    name: 'Domácnosť',
    iconName: 'Home',
    color: '#0ea5e9', // Sky blue
    subcategories: ['Bežné výdavky', 'Potraviny & Nákupy', 'Prerábanie', 'Energie & Nájom', 'Drogéria & Upratovanie'],
    isSystem: true,
  },
  {
    id: 'cat_vylet',
    name: 'Výlet',
    iconName: 'Plane',
    color: '#f59e0b', // Amber
    subcategories: ['Letenky & Doprava', 'Ubytovanie', 'Reštaurácie & Gastro', 'Vstupy & Atrakcie', 'Darčeky zo zájazdu'],
    isSystem: true,
  },
  {
    id: 'cat_spolocne',
    name: 'Spoločné výdavky / Ostatné',
    iconName: 'ShoppingBag',
    color: '#10b981', // Emerald
    subcategories: ['Kaviareň & Reštaurácia', 'Kino & Zábava', 'Auto & Pohonné hmoty', 'Zdravie & Lekáreň', 'Darčeky pre známych'],
    isSystem: true,
  },
];

// Generate dynamic starter expenses for current month and previous month
const today = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const curYear = today.getFullYear();
const curMonth = pad(today.getMonth() + 1);
const curDay = pad(today.getDate());
const curDateStr = `${curYear}-${curMonth}-${curDay}`;

const prevMonthDate = new Date(today);
prevMonthDate.setDate(today.getDate() - 2);
const prevDay = pad(prevMonthDate.getDate());
const prevDateStr = `${prevMonthDate.getFullYear()}-${pad(prevMonthDate.getMonth() + 1)}-${prevDay}`;

const threeDaysAgoDate = new Date(today);
threeDaysAgoDate.setDate(today.getDate() - 4);
const threeDaysAgoStr = `${threeDaysAgoDate.getFullYear()}-${pad(threeDaysAgoDate.getMonth() + 1)}-${pad(threeDaysAgoDate.getDate())}`;

export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp_sample_1',
    amount: 68.40,
    paid_by: 'user_1',
    category_id: 'cat_domacnost',
    subcategory: 'Potraviny & Nákupy',
    date: curDateStr,
    note: 'Týždenný nákup v Lidli',
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'exp_sample_2',
    amount: 34.00,
    paid_by: 'user_2',
    category_id: 'cat_spolocne',
    subcategory: 'Kaviareň & Reštaurácia',
    date: curDateStr,
    note: 'Sobotný brunch a koláčiky',
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'exp_sample_3',
    amount: 145.00,
    paid_by: 'user_1',
    category_id: 'cat_vylet',
    subcategory: 'Ubytovanie',
    country: 'Taliansko',
    date: prevDateStr,
    note: 'Záloha za apartmán vo Florencii',
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'exp_sample_4',
    amount: 82.50,
    paid_by: 'user_2',
    category_id: 'cat_domacnost',
    subcategory: 'Prerábanie',
    date: threeDaysAgoStr,
    note: 'Nové police a svetlá do obývačky',
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'exp_sample_5',
    amount: 120.00,
    paid_by: 'user_1',
    category_id: 'cat_vylet',
    subcategory: 'Letenky & Doprava',
    country: 'Taliansko',
    date: threeDaysAgoStr,
    note: 'Vlaky Italo Rím - Florencia',
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 100).toISOString(),
  },
];

export const POPULAR_COUNTRIES = [
  'Taliansko',
  'Japonsko',
  'Španielsko',
  'Rakúsko',
  'Česko',
  'Chorvátsko',
  'Grécko',
  'Francúzsko',
  'Nemecko',
  'Portugalsko',
  'Poľsko',
  'Spojené kráľovstvo',
  'Nórsko',
  'Island',
  'Slovensko (Hory)',
];

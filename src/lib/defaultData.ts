import { Category, UserProfile, Expense, AppEvent } from '../types';

export interface ProfileTheme {
  id: string;
  name: string;
  gradient: string;
  accentColor: string;
  borderClass: string;
}

export const PROFILE_THEMES: ProfileTheme[] = [
  { id: 'ocean', name: 'Azúrový oceán', gradient: 'from-sky-500/20 via-blue-500/15 to-indigo-500/10', accentColor: '#0284c7', borderClass: 'border-sky-300 dark:border-sky-800' },
  { id: 'rose', name: 'Romantická ruža', gradient: 'from-rose-500/20 via-pink-500/15 to-amber-500/10', accentColor: '#e11d48', borderClass: 'border-rose-300 dark:border-rose-800' },
  { id: 'sunset', name: 'Západ slnka', gradient: 'from-amber-500/20 via-orange-500/15 to-rose-500/10', accentColor: '#f59e0b', borderClass: 'border-amber-300 dark:border-amber-800' },
  { id: 'emerald', name: 'Smaragdový les', gradient: 'from-emerald-500/20 via-teal-500/15 to-cyan-500/10', accentColor: '#10b981', borderClass: 'border-emerald-300 dark:border-emerald-800' },
  { id: 'violet', name: 'Kráľovská fialová', gradient: 'from-purple-500/20 via-indigo-500/15 to-pink-500/10', accentColor: '#8b5cf6', borderClass: 'border-purple-300 dark:border-purple-800' },
  { id: 'cyber', name: 'Midnight Slate', gradient: 'from-slate-700/30 via-slate-800/40 to-slate-900/50', accentColor: '#64748b', borderClass: 'border-slate-400 dark:border-slate-700' },
];

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Danko',
    avatarColor: '#0284c7', // Sky Blue
    emoji: '🧔',
    pin: '',
    themeId: 'ocean',
    themeGradient: 'from-sky-500/20 via-blue-500/15 to-indigo-500/10',
  },
  {
    id: 'user_2',
    name: 'Simonka',
    avatarColor: '#e11d48', // Rose Pink/Red
    emoji: '👩',
    pin: '',
    themeId: 'rose',
    themeGradient: 'from-rose-500/20 via-pink-500/15 to-amber-500/10',
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_vylet',
    name: 'Výlet & Cestovanie',
    iconName: 'Plane',
    color: '#f59e0b', // Amber
    subcategories: [
      'Letenky & Doprava',
      'Ubytovanie (Hotel / Airbnb)',
      'Reštaurácie & Bary',
      'Vstupy & Atrakcie',
      'Darčeky & Suveníry',
      'Poistenie & Taxíky',
    ],
    isSystem: true,
    defaultEventType: 'trip',
  },
  {
    id: 'cat_rande',
    name: 'Spoločné rande',
    iconName: 'Heart',
    color: '#e11d48', // Rose
    subcategories: [
      'Nákupy',
      'Večere',
      'Obedy',
      'Snacks & Maškrty',
      'Kavičky & Zákusky',
      'Kino & Zážitky',
      'Wellness & Oddych',
    ],
    isSystem: true,
    defaultEventType: 'dates',
  },
  {
    id: 'cat_prerabka',
    name: 'Prerábanie bytu',
    iconName: 'Wrench',
    color: '#0ea5e9', // Sky blue
    subcategories: [
      'Stavebný materiál',
      'OBI / Bauhaus',
      'Vodár',
      'Elektrikár',
      'Nábytok & Sanita',
      'Drobné náradie & Farby',
      'Odvoz odpadu',
    ],
    isSystem: true,
    defaultEventType: 'renovation',
  },
  {
    id: 'cat_domacnost',
    name: 'Domácnosť & Bežné výdavky',
    iconName: 'Home',
    color: '#10b981', // Emerald
    subcategories: [
      'Energie & Nájom',
      'Potraviny domov',
      'Drogéria & Upratovanie',
      'Auto & Pohonné hmoty',
      'Zdravie & Lekáreň',
    ],
    isSystem: true,
    defaultEventType: 'household',
  },
];

export const DEFAULT_EVENTS: AppEvent[] = [
  {
    id: 'event_prerabka',
    name: 'Prerábka bytu',
    type: 'renovation',
    emoji: '🔨',
    color: '#0ea5e9',
    description: 'Rekonštrukcia bytu a vybavenie domácnosti',
    currency: 'EUR',
    currency_symbol: '€',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'event_rande',
    name: 'Spoločné rande & víkendy',
    type: 'dates',
    emoji: '🍷',
    color: '#e11d48',
    description: 'Naše spoločné večere, obedy, kavičky a kino',
    currency: 'EUR',
    currency_symbol: '€',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'event_vylet_cesko',
    name: 'Výlet a cestovanie',
    type: 'trip',
    emoji: '✈️',
    color: '#f59e0b',
    destination_country: 'Česko',
    currency: 'CZK',
    currency_symbol: 'Kč',
    exchange_rate_to_eur: 25.2,
    description: 'Spoločné výlety, dovolenky a cestovanie',
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

// VŠETKY VÝDAVKY SÚ VYNULOVANÉ (ČISTÝ ŠTART PRE DANKA A SIMONKU)
export const SAMPLE_EXPENSES: Expense[] = [];

export const POPULAR_COUNTRIES = [
  'Česko',
  'Taliansko',
  'Rakúsko',
  'Poľsko',
  'Maďarsko',
  'Španielsko',
  'Chorvátsko',
  'Grécko',
  'Spojené kráľovstvo (UK)',
  'Francúzsko',
  'Nemecko',
  'Portugalsko',
  'Japonsko',
  'USA',
  'Švajčiarsko',
  'Nórsko',
  'Island',
  'Thajsko',
  'Turecko',
  'Slovensko',
];

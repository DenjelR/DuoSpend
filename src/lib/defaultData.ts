import { Category, UserProfile, Expense, AppEvent } from '../types';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Danko',
    avatarColor: '#0284c7', // Sky Blue
    emoji: '🧔',
    pin: '',
  },
  {
    id: 'user_2',
    name: 'Simonka',
    avatarColor: '#e11d48', // Rose Pink/Red
    emoji: '👩',
    pin: '',
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
    name: 'Výlet Praha & Česko',
    type: 'trip',
    emoji: '✈️',
    color: '#f59e0b',
    destination_country: 'Česko',
    currency: 'CZK',
    currency_symbol: 'Kč',
    exchange_rate_to_eur: 25.2,
    description: 'Predĺžený víkend v Prahe a pamiatky',
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

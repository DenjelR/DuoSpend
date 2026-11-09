import { Category, UserProfile, Expense, AppEvent } from '../types';

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

export const DEFAULT_EVENTS: AppEvent[] = [
  {
    id: 'event_prerabka',
    name: 'Prerábka bytu',
    type: 'renovation',
    emoji: '🔨',
    color: '#0ea5e9',
    description: 'Kompletná rekonštrukcia kúpeľne, kuchyne a nové podlahy',
    target_budget: 4500,
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'event_vylet_taliansko',
    name: 'Výlet Taliansko - Florencia & Rím',
    type: 'trip',
    emoji: '✈️',
    color: '#f59e0b',
    destination: 'Taliansko',
    description: 'Jarný výlet: Florencia, Toskánsko a pamiatky v Ríme',
    target_budget: 1200,
    created_at: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'event_rande',
    name: 'Spoločné rande & víkendy',
    type: 'dates',
    emoji: '🍷',
    color: '#e11d48',
    description: 'Večere, kavičky, kino a spoločné zážitky',
    target_budget: 500,
    created_at: new Date(Date.now() - 3600000 * 24 * 40).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'event_vylet_japonsko',
    name: 'Výlet Japonsko 2026',
    type: 'trip',
    emoji: '🗾',
    color: '#8b5cf6',
    destination: 'Japonsko',
    description: 'Jesenná cesta za sakurami a kultúrou: Tokio, Kjóto a Fudži',
    target_budget: 3500,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_vylety',
    name: 'Výlety & Cestovanie',
    iconName: 'Plane',
    color: '#f59e0b', // Amber
    subcategories: [
      'Letenky & Doprava',
      'Ubytovanie (Hotel / Airbnb)',
      'Reštaurácie & Bary',
      'Vstupy & Atrakcie',
      'Darčeky & Suveníry',
      'Poistenie & Miestne taxíky',
    ],
    isSystem: true,
    defaultEventType: 'trip',
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
      'Odvoz odpadu & Upratovanie',
    ],
    isSystem: true,
    defaultEventType: 'renovation',
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
    id: 'cat_domacnost',
    name: 'Domácnosť & Ostatné',
    iconName: 'Home',
    color: '#10b981', // Emerald
    subcategories: [
      'Energie & Nájom',
      'Potraviny domov',
      'Drogéria & Čistiace prostriedky',
      'Auto & Benzín',
      'Zdravie & Lekáreň',
    ],
    isSystem: true,
    defaultEventType: 'other',
  },
];

const today = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const curDateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

const dMinus1 = new Date(today);
dMinus1.setDate(today.getDate() - 1);
const dateMinus1Str = `${dMinus1.getFullYear()}-${pad(dMinus1.getMonth() + 1)}-${pad(dMinus1.getDate())}`;

const dMinus3 = new Date(today);
dMinus3.setDate(today.getDate() - 3);
const dateMinus3Str = `${dMinus3.getFullYear()}-${pad(dMinus3.getMonth() + 1)}-${pad(dMinus3.getDate())}`;

const dMinus5 = new Date(today);
dMinus5.setDate(today.getDate() - 5);
const dateMinus5Str = `${dMinus5.getFullYear()}-${pad(dMinus5.getMonth() + 1)}-${pad(dMinus5.getDate())}`;

export const SAMPLE_EXPENSES: Expense[] = [
  // 1. Prerábka bytu expenses
  {
    id: 'exp_renov_1',
    amount: 245.80,
    paid_by: 'user_1',
    event_id: 'event_prerabka',
    category_id: 'cat_prerabka',
    subcategory: 'OBI / Bauhaus',
    item_title: 'Obkladačky a hydroizolačné lepidlo',
    note: 'Kúpené v OBI Ružinov, lepidlo C2TES1 a 6 balení obkladu do sprchovacieho kúta',
    date: curDateStr,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'exp_renov_2',
    amount: 180.00,
    paid_by: 'user_2',
    event_id: 'event_prerabka',
    category_id: 'cat_prerabka',
    subcategory: 'Vodár',
    item_title: 'Výmena prívodov a montáž podomietkového modulu',
    note: 'Pán majster Horváth, zaplatené v hotovosti s dokladom',
    date: dateMinus1Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'exp_renov_3',
    amount: 120.00,
    paid_by: 'user_1',
    event_id: 'event_prerabka',
    category_id: 'cat_prerabka',
    subcategory: 'Elektrikár',
    item_title: 'Nové poistky a káble pre indukciu',
    note: 'Príprava trojfázového prívodu pre novú kuchynskú linku',
    date: dateMinus3Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
  {
    id: 'exp_renov_4',
    amount: 88.50,
    paid_by: 'user_2',
    event_id: 'event_prerabka',
    category_id: 'cat_prerabka',
    subcategory: 'Stavebný materiál',
    item_title: 'Sadrokartónové dosky a profily UD/CD',
    note: 'Materiál na znížený strop v kúpeľni',
    date: dateMinus5Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 120).toISOString(),
  },

  // 2. Výlet Taliansko expenses
  {
    id: 'exp_trip_1',
    amount: 168.00,
    paid_by: 'user_1',
    event_id: 'event_vylet_taliansko',
    category_id: 'cat_vylety',
    subcategory: 'Letenky & Doprava',
    item_title: 'Spiatočné letenky Viedeň - Rím',
    note: 'Ryanair letenky vrátane jednej spoločnej 20kg batožiny',
    country: 'Taliansko',
    date: dateMinus3Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'exp_trip_2',
    amount: 320.00,
    paid_by: 'user_2',
    event_id: 'event_vylet_taliansko',
    category_id: 'cat_vylety',
    subcategory: 'Ubytovanie (Hotel / Airbnb)',
    item_title: 'Boutique apartmán vo Florencii',
    note: 'Záloha za 3 noci blízko Ponte Vecchio s terasou',
    country: 'Taliansko',
    date: dateMinus3Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 62).toISOString(),
  },
  {
    id: 'exp_trip_3',
    amount: 64.50,
    paid_by: 'user_1',
    event_id: 'event_vylet_taliansko',
    category_id: 'cat_vylety',
    subcategory: 'Reštaurácie & Bary',
    item_title: 'Večera v rodinnej trattórii',
    note: 'Pravá rímska carbonara, domáce tiramisu a fľaša Chianti',
    country: 'Taliansko',
    date: curDateStr,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'exp_trip_4',
    amount: 52.00,
    paid_by: 'user_2',
    event_id: 'event_vylet_taliansko',
    category_id: 'cat_vylety',
    subcategory: 'Vstupy & Atrakcie',
    item_title: 'Vstupy do Galleria degli Uffizi',
    note: 'Vopred rezervované časové vstupenky pre dvoch',
    country: 'Taliansko',
    date: dateMinus1Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  },

  // 3. Spoločné rande expenses
  {
    id: 'exp_rande_1',
    amount: 58.00,
    paid_by: 'user_1',
    event_id: 'event_rande',
    category_id: 'cat_rande',
    subcategory: 'Večere',
    item_title: 'Romantická večera v bistre',
    note: 'Oslava úspešného týždňa, sviečková a výborné domáce cestoviny',
    date: curDateStr,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'exp_rande_2',
    amount: 14.80,
    paid_by: 'user_2',
    event_id: 'event_rande',
    category_id: 'cat_rande',
    subcategory: 'Kavičky & Zákusky',
    item_title: 'Výberová káva a pistáciové croissanty',
    note: 'Nedeľné ráno v pekárni',
    date: dateMinus1Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
  {
    id: 'exp_rande_3',
    amount: 27.00,
    paid_by: 'user_2',
    event_id: 'event_rande',
    category_id: 'cat_rande',
    subcategory: 'Kino & Zážitky',
    item_title: 'Lístky do kina a popcorn',
    note: 'Nový film v kine, večerné predstavenie',
    date: dateMinus3Str,
    is_settled: false,
    settlement_id: null,
    created_at: new Date(Date.now() - 3600000 * 75).toISOString(),
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
  'Island',
  'Nórsko',
  'Slovensko (Hory & Tatry)',
];
